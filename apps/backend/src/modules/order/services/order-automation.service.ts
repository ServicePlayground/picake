import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import { OrderStatus } from "@apps/backend/modules/order/constants/order.constants";
import {
  isPickupPendingDue,
  isPickupReminderDue,
  isPickupReminderLeadEligible,
  isPaymentPendingExpired,
  PICKUP_REMINDER_LEAD_MS,
} from "@apps/backend/modules/order/utils/order-datetime.util";
import { LoggerUtil } from "@apps/backend/common/utils/logger.util";
import { SentryUtil } from "@apps/backend/common/utils/sentry.util";
import { OrderLifecycleHookService } from "@apps/backend/modules/order/services/order-lifecycle-hook.service";
import { NotificationOrderDispatchService } from "@apps/backend/modules/notification/services/notification-order-dispatch.service";
import { ORDER_STATUS_TRANSITION_SOURCE } from "@apps/backend/modules/order/types/order-lifecycle.types";

/**
 * 입금대기 만료, 픽업 시각 도달 자동 전환, 픽업 24시간 전 안내 등 주문 자동화
 */
@Injectable()
export class OrderAutomationService implements OnModuleInit, OnModuleDestroy {
  private batchTimer?: ReturnType<typeof setInterval>;
  private readonly batchIntervalMs = 5 * 60 * 1000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly orderLifecycleHookService: OrderLifecycleHookService,
    private readonly notificationOrderDispatchService: NotificationOrderDispatchService,
  ) {}

  onModuleInit(): void {
    void this.runBatchTransitions();
    this.batchTimer = setInterval(() => void this.runBatchTransitions(), this.batchIntervalMs);
  }

  onModuleDestroy(): void {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
    }
  }

  /**
   * 단일 주문에 대해 만료·픽업 전환·픽업 안내 규칙을 즉시 적용 (최신 상태 보장)
   * 만료 규칙: 입금대기 상태에서 `paymentPendingDeadlineAt`(없으면 픽업·진입 시각 기준 복원)이 지난 주문을 취소완료로 전환합니다. 예약신청 단계는 자동 만료하지 않습니다.
   * 픽업 안내: 예약확정 상태에서 픽업 24시간 전이면 구매자 안내를 1회 발송합니다. (주문~픽업이 24시간 미만이면 생략)
   * 픽업 규칙: 예약확정 상태에서 픽업 시각이 도달했거나 지난 주문을 픽업대기로 전환합니다.
   */
  async syncOrderLifecycleById(orderId: string): Promise<void> {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return;
    }
    const now = new Date();

    if (order.orderStatus === OrderStatus.PAYMENT_PENDING) {
      const expiryInput = {
        paymentPendingDeadlineAt: order.paymentPendingDeadlineAt,
        paymentPendingAt: order.paymentPendingAt,
        createdAt: order.createdAt,
        pickupDate: order.pickupDate,
      };
      if (isPaymentPendingExpired(now, expiryInput)) {
        const { count } = await this.prisma.order.updateMany({
          where: { id: orderId, orderStatus: OrderStatus.PAYMENT_PENDING },
          data: { orderStatus: OrderStatus.CANCEL_COMPLETED },
        });
        if (count === 1) {
          this.orderLifecycleHookService.afterOrderStatusTransition({
            orderId,
            fromStatus: OrderStatus.PAYMENT_PENDING,
            toStatus: OrderStatus.CANCEL_COMPLETED,
            source: ORDER_STATUS_TRANSITION_SOURCE.AUTOMATION_SYNC,
          });
        }
      }
      return;
    }

    if (order.orderStatus === OrderStatus.CONFIRMED && order.pickupDate) {
      await this.trySendPickupReminder({
        orderId,
        createdAt: order.createdAt,
        pickupDate: order.pickupDate,
        pickupReminderSentAt: order.pickupReminderSentAt,
        now,
      });

      if (isPickupPendingDue(order.pickupDate, now)) {
        const { count } = await this.prisma.order.updateMany({
          where: {
            id: orderId,
            orderStatus: OrderStatus.CONFIRMED,
          },
          data: { orderStatus: OrderStatus.PICKUP_PENDING },
        });
        if (count === 1) {
          this.orderLifecycleHookService.afterOrderStatusTransition({
            orderId,
            fromStatus: OrderStatus.CONFIRMED,
            toStatus: OrderStatus.PICKUP_PENDING,
            source: ORDER_STATUS_TRANSITION_SOURCE.AUTOMATION_SYNC,
          });
        }
      }
    }
  }

  /**
   * 앱(모듈)이 기동된 직후 5분마다 실행되며 주문 상태 자동화
   * 전체 주문에 대해 `syncOrderLifecycleById`와 **같은 조건**으로 상태를 맞춥니다.
   */
  async runBatchTransitions(): Promise<void> {
    try {
      const now = new Date();

      const paymentPendingRows = await this.prisma.order.findMany({
        where: {
          orderStatus: OrderStatus.PAYMENT_PENDING,
          OR: [{ paymentPendingDeadlineAt: { lte: now } }, { paymentPendingDeadlineAt: null }],
        },
        select: {
          id: true,
          paymentPendingDeadlineAt: true,
          paymentPendingAt: true,
          createdAt: true,
          pickupDate: true,
        },
      });

      for (const row of paymentPendingRows) {
        if (!isPaymentPendingExpired(now, row)) {
          continue;
        }
        const { count } = await this.prisma.order.updateMany({
          where: { id: row.id, orderStatus: OrderStatus.PAYMENT_PENDING },
          data: { orderStatus: OrderStatus.CANCEL_COMPLETED },
        });
        if (count === 1) {
          this.orderLifecycleHookService.afterOrderStatusTransition({
            orderId: row.id,
            fromStatus: OrderStatus.PAYMENT_PENDING,
            toStatus: OrderStatus.CANCEL_COMPLETED,
            source: ORDER_STATUS_TRANSITION_SOURCE.AUTOMATION_BATCH,
          });
        }
      }

      // 픽업 24시간 전 안내 (예약확정 · 미발송 · 픽업이 아직 남음)
      const reminderWindowEnd = new Date(now.getTime() + PICKUP_REMINDER_LEAD_MS);
      const reminderCandidates = await this.prisma.order.findMany({
        where: {
          orderStatus: OrderStatus.CONFIRMED,
          pickupReminderSentAt: null,
          pickupDate: {
            gt: now,
            lte: reminderWindowEnd,
          },
        },
        select: {
          id: true,
          createdAt: true,
          pickupDate: true,
          pickupReminderSentAt: true,
        },
      });

      for (const row of reminderCandidates) {
        if (!row.pickupDate) continue;
        await this.trySendPickupReminder({
          orderId: row.id,
          createdAt: row.createdAt,
          pickupDate: row.pickupDate,
          pickupReminderSentAt: row.pickupReminderSentAt,
          now,
        });
      }

      // sync의 `CONFIRMED && pickupDate && isPickupPendingDue`와 동일
      const confirmedWithPickup = await this.prisma.order.findMany({
        where: {
          orderStatus: OrderStatus.CONFIRMED,
          pickupDate: { lte: now },
        },
        select: { id: true, pickupDate: true },
      });

      for (const row of confirmedWithPickup) {
        if (!row.pickupDate || !isPickupPendingDue(row.pickupDate, now)) {
          continue;
        }
        // `syncOrderLifecycleById`와 경합해도 훅은 실제 전환이 1건만 일어났을 때만 발화
        const { count } = await this.prisma.order.updateMany({
          where: {
            id: row.id,
            orderStatus: OrderStatus.CONFIRMED,
          },
          data: { orderStatus: OrderStatus.PICKUP_PENDING },
        });
        if (count === 1) {
          this.orderLifecycleHookService.afterOrderStatusTransition({
            orderId: row.id,
            fromStatus: OrderStatus.CONFIRMED,
            toStatus: OrderStatus.PICKUP_PENDING,
            source: ORDER_STATUS_TRANSITION_SOURCE.AUTOMATION_BATCH,
          });
        }
      }
    } catch (e) {
      LoggerUtil.log(`주문 자동 전환 배치 실패: ${e instanceof Error ? e.message : String(e)}`);
      SentryUtil.captureException(e, "error", {
        module: "order-automation",
        job: "runBatchTransitions",
        source: ORDER_STATUS_TRANSITION_SOURCE.AUTOMATION_BATCH,
      });
    }
  }

  /**
   * 목록 페이지에 포함된 주문에 대해 `syncOrderLifecycleById`를 병렬 적용합니다.
   * 호출부에서 동일 조건으로 `findMany`를 한 번 더 하면 상세 조회와 같은 시점의 상태를 맞출 수 있습니다.
   */
  async syncOrderLifecycleForIds(orderIds: string[]): Promise<void> {
    if (orderIds.length === 0) {
      return;
    }
    await Promise.all(orderIds.map((id) => this.syncOrderLifecycleById(id)));
  }

  /**
   * 픽업 24시간 전 안내를 1회만 발송합니다.
   * - 주문 생성~픽업이 24시간 미만이면 발송하지 않습니다.
   * - `pickupReminderSentAt`을 먼저 확정해 배치·sync 경합 시 중복 발송을 막습니다.
   */
  private async trySendPickupReminder(params: {
    orderId: string;
    createdAt: Date;
    pickupDate: Date;
    pickupReminderSentAt: Date | null;
    now: Date;
  }): Promise<void> {
    const { orderId, createdAt, pickupDate, pickupReminderSentAt, now } = params;
    if (pickupReminderSentAt) return;
    if (!isPickupReminderLeadEligible(createdAt, pickupDate)) return;
    if (!isPickupReminderDue(pickupDate, now)) return;

    const { count } = await this.prisma.order.updateMany({
      where: {
        id: orderId,
        orderStatus: OrderStatus.CONFIRMED,
        pickupReminderSentAt: null,
      },
      data: { pickupReminderSentAt: now },
    });
    if (count !== 1) return;

    await this.notificationOrderDispatchService.handlePickupReminder(orderId);
  }
}
