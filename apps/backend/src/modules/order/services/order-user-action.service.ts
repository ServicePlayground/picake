import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import {
  ORDER_ERROR_MESSAGES,
  OrderStatus,
} from "@apps/backend/modules/order/constants/order.constants";
import { OrderOwnershipUtil } from "@apps/backend/modules/order/utils/order-ownership.util";
import { OrderAutomationService } from "@apps/backend/modules/order/services/order-automation.service";
import { isPaymentPendingExpired } from "@apps/backend/modules/order/utils/order-datetime.util";
import {
  ORDER_PRE_PAYMENT_WINDOW_STATUSES,
  USER_CANCEL_REFUND_REQUEST_SOURCE_STATUSES,
} from "@apps/backend/modules/order/utils/order-status-transition.util";
import { LoggerUtil } from "@apps/backend/common/utils/logger.util";
import { OrderLifecycleHookService } from "@apps/backend/modules/order/services/order-lifecycle-hook.service";
import { ORDER_STATUS_TRANSITION_SOURCE } from "@apps/backend/modules/order/types/order-lifecycle.types";
import {
  CancelOrderBeforePaymentRequestDto,
  MarkPaymentCompleteRequestDto,
  RequestCancelRefundRequestDto,
  SubmitRefundAccountRequestDto,
} from "@apps/backend/modules/order/dto/order-user-action.dto";

/**
 * 사용자(구매자)가 호출하는 주문 액션 전용 서비스.
 *
 * 공통 흐름: 소유권 검증 → `syncOrderLifecycleById`로 픽업일·입금 만료 등 자동 전환 반영 후 DB 재조회 → 상태 검증 및 업데이트.
 */
@Injectable()
export class OrderUserActionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orderAutomationService: OrderAutomationService,
    private readonly orderLifecycleHookService: OrderLifecycleHookService,
  ) {}

  /**
   * 사용자가 입금을 완료했다고 표시합니다. `PAYMENT_PENDING` → `PAYMENT_COMPLETED` (예약신청 단계에서는 불가).
   * 소유권 검증 → `syncOrderLifecycleById` → 조회 → 검증 → 갱신 → 훅 순서입니다.
   *
   * 입금 기한이 지나 실패로 끝나는 경우에도 `depositorName`은 저장합니다. 무통장입금이라 서버는
   * 실제 입금 여부를 알 수 없고, 이 값이 "손님이 입금했다고 주장하며 알려준 이름"이라는 유일한
   * 단서이기 때문입니다. 판매자가 통장 내역과 대조할 때 사용합니다(입금 확인 자체가 아님).
   */
  async markPaymentCompleted(
    orderId: string,
    userId: string,
    dto: MarkPaymentCompleteRequestDto,
  ): Promise<{ id: string }> {
    await OrderOwnershipUtil.verifyOrderUserOwnership(this.prisma, orderId, userId);
    await this.orderAutomationService.syncOrderLifecycleById(orderId);

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: {
        orderStatus: true,
        createdAt: true,
        paymentPendingAt: true,
        paymentPendingDeadlineAt: true,
        pickupDate: true,
      },
    });
    if (!order) {
      throw new NotFoundException(ORDER_ERROR_MESSAGES.NOT_FOUND);
    }

    const now = new Date();
    const current = order.orderStatus as OrderStatus;

    if (current === OrderStatus.CANCEL_COMPLETED) {
      // `syncOrderLifecycleById`가 이미 만료 취소한 뒤 도달하는 경로(실제로 가장 흔함).
      // 취소는 되돌리지 않되, 사용자가 방금 신고한 입금자명은 남깁니다.
      await this.recordDepositorClaim(orderId, dto.depositorName);
      throw new BadRequestException(ORDER_ERROR_MESSAGES.PAYMENT_PENDING_EXPIRED);
    }

    if (current === OrderStatus.PAYMENT_PENDING) {
      if (
        isPaymentPendingExpired(now, {
          paymentPendingDeadlineAt: order.paymentPendingDeadlineAt,
          paymentPendingAt: order.paymentPendingAt,
          createdAt: order.createdAt,
          pickupDate: order.pickupDate,
        })
      ) {
        // 조회 이후 만료 시각을 넘긴 경로. 취소와 동시에 입금자명을 남깁니다.
        await this.prisma.order.update({
          where: { id: orderId },
          data: {
            orderStatus: OrderStatus.CANCEL_COMPLETED,
            depositorName: dto.depositorName,
            paymentPendingExpiredAt: now,
          },
        });
        this.orderLifecycleHookService.afterOrderStatusTransition({
          orderId,
          fromStatus: OrderStatus.PAYMENT_PENDING,
          toStatus: OrderStatus.CANCEL_COMPLETED,
          source: ORDER_STATUS_TRANSITION_SOURCE.USER_ACTION_PAYMENT_EXPIRED,
        });
        throw new BadRequestException(ORDER_ERROR_MESSAGES.PAYMENT_PENDING_EXPIRED);
      }
    }

    if (current !== OrderStatus.PAYMENT_PENDING) {
      LoggerUtil.log(`입금완료 처리 실패: 상태 불일치 - orderId: ${orderId}, status: ${current}`);
      throw new BadRequestException(ORDER_ERROR_MESSAGES.INVALID_USER_ORDER_ACTION);
    }

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        orderStatus: OrderStatus.PAYMENT_COMPLETED,
        depositorName: dto.depositorName,
      },
    });
    this.orderLifecycleHookService.afterOrderStatusTransition({
      orderId,
      fromStatus: OrderStatus.PAYMENT_PENDING,
      toStatus: OrderStatus.PAYMENT_COMPLETED,
      source: ORDER_STATUS_TRANSITION_SOURCE.USER_ACTION,
    });
    return { id: orderId };
  }

  /**
   * 입금 전 사용자 취소. `RESERVATION_REQUESTED` 또는 `PAYMENT_PENDING`에서 호출합니다.
   * 소유권 검증 → `syncOrderLifecycleById` → 조회 → 검증 → 갱신 → 훅 순서입니다.
   *
   * 결과 상태는 사용자가 신고한 입금 여부(`dto.hasDeposited`)에 따라 갈립니다.
   * - 미입금(기본) → `CANCEL_COMPLETED`(취소완료). 환불할 돈이 없으므로 종료 상태로 끝냅니다.
   * - 입금함 → `CANCEL_REFUND_PENDING`(취소환불대기). 환불 계좌를 함께 저장해 환불 절차로 넘깁니다.
   *
   * 무통장입금이라 서버는 실제 입금 여부를 알 수 없어 자기신고에 의존합니다. 허위 신고는
   * 판매자가 통장 내역을 확인한 뒤 `CANCEL_REFUND_COMPLETED`로 넘기는 기존 절차에서 걸러집니다.
   */
  async cancelBeforePayment(
    orderId: string,
    userId: string,
    dto: CancelOrderBeforePaymentRequestDto,
  ): Promise<{ id: string }> {
    await OrderOwnershipUtil.verifyOrderUserOwnership(this.prisma, orderId, userId);
    await this.orderAutomationService.syncOrderLifecycleById(orderId);

    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException(ORDER_ERROR_MESSAGES.NOT_FOUND);
    }

    const beforeCancel = order.orderStatus as OrderStatus;
    if (!ORDER_PRE_PAYMENT_WINDOW_STATUSES.has(beforeCancel)) {
      throw new BadRequestException(ORDER_ERROR_MESSAGES.INVALID_USER_ORDER_ACTION);
    }

    if (dto.hasDeposited) {
      // 예약신청 단계는 판매자가 계좌를 안내하기 전이라 입금 자체가 불가능합니다.
      if (beforeCancel !== OrderStatus.PAYMENT_PENDING) {
        throw new BadRequestException(ORDER_ERROR_MESSAGES.INVALID_USER_ORDER_ACTION);
      }

      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          orderStatus: OrderStatus.CANCEL_REFUND_PENDING,
          // 환불 절차로 넘어가므로 사유도 환불 요청 사유로 기록합니다(판매자 화면 표기 일치).
          refundRequestReason: dto.reason,
          refundBankName: dto.bankName,
          refundBankAccountNumber: dto.bankAccountNumber,
          refundAccountHolderName: dto.accountHolderName,
        },
      });
      this.orderLifecycleHookService.afterOrderStatusTransition({
        orderId,
        fromStatus: beforeCancel,
        toStatus: OrderStatus.CANCEL_REFUND_PENDING,
        source: ORDER_STATUS_TRANSITION_SOURCE.USER_ACTION,
      });
      LoggerUtil.log(
        `[OrderUserAction] 입금 신고 후 취소 → 취소환불대기 - orderId: ${orderId}, from: ${beforeCancel}`,
      );
      return { id: orderId };
    }

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        orderStatus: OrderStatus.CANCEL_COMPLETED,
        userCancelReason: dto.reason,
      },
    });
    this.orderLifecycleHookService.afterOrderStatusTransition({
      orderId,
      fromStatus: beforeCancel,
      toStatus: OrderStatus.CANCEL_COMPLETED,
      source: ORDER_STATUS_TRANSITION_SOURCE.USER_ACTION,
    });
    return { id: orderId };
  }

  /**
   * 취소·환불 요청. `USER_CANCEL_REFUND_REQUEST_SOURCE_STATUSES`에서만 허용.
   * 성공 시 `CANCEL_REFUND_PENDING`(취소환불대기)으로 전환됩니다.
   */
  async requestRefund(
    orderId: string,
    userId: string,
    dto: RequestCancelRefundRequestDto,
  ): Promise<{ id: string }> {
    await OrderOwnershipUtil.verifyOrderUserOwnership(this.prisma, orderId, userId);
    await this.orderAutomationService.syncOrderLifecycleById(orderId);

    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException(ORDER_ERROR_MESSAGES.NOT_FOUND);
    }

    const fromStatus = order.orderStatus as OrderStatus;
    if (!USER_CANCEL_REFUND_REQUEST_SOURCE_STATUSES.has(fromStatus)) {
      throw new BadRequestException(ORDER_ERROR_MESSAGES.INVALID_USER_ORDER_ACTION);
    }

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        orderStatus: OrderStatus.CANCEL_REFUND_PENDING,
        refundRequestReason: dto.reason,
        refundBankName: dto.bankName,
        refundBankAccountNumber: dto.bankAccountNumber,
        refundAccountHolderName: dto.accountHolderName,
      },
    });
    this.orderLifecycleHookService.afterOrderStatusTransition({
      orderId,
      fromStatus,
      toStatus: OrderStatus.CANCEL_REFUND_PENDING,
      source: ORDER_STATUS_TRANSITION_SOURCE.USER_ACTION,
    });
    return { id: orderId };
  }

  /**
   * 이미 취소환불대기인 주문에 환불 계좌만 입력합니다. 상태는 바꾸지 않습니다.
   *
   * 관리자가 취소완료 주문을 되돌린 경우(`revertToRefundPending`) 환불 계좌가 비어 있습니다.
   * 그 주문의 환불을 진행하려면 손님이 계좌를 알려줘야 하는데, 기존 `requestRefund`는 입금완료
   * 이후 상태에서만 호출할 수 있어 이 경로가 필요합니다.
   *
   * 환불이 끝나기 전까지는 다시 입력할 수 있습니다(오타 정정). 상태 전이가 없어 훅도 호출하지 않습니다.
   */
  async submitRefundAccount(
    orderId: string,
    userId: string,
    dto: SubmitRefundAccountRequestDto,
  ): Promise<{ id: string }> {
    await OrderOwnershipUtil.verifyOrderUserOwnership(this.prisma, orderId, userId);

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { orderStatus: true },
    });
    if (!order) {
      throw new NotFoundException(ORDER_ERROR_MESSAGES.NOT_FOUND);
    }

    if ((order.orderStatus as OrderStatus) !== OrderStatus.CANCEL_REFUND_PENDING) {
      throw new BadRequestException(ORDER_ERROR_MESSAGES.INVALID_USER_ORDER_ACTION);
    }

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        refundBankName: dto.bankName,
        refundBankAccountNumber: dto.bankAccountNumber,
        refundAccountHolderName: dto.accountHolderName,
      },
    });
    LoggerUtil.log(`[OrderUserAction] 환불 계좌 입력 - orderId: ${orderId}`);
    return { id: orderId };
  }

  /**
   * 입금완료 처리가 실패로 끝날 때, 사용자가 입력한 입금자명만 주문에 남깁니다.
   *
   * 이미 값이 있으면 덮어쓰지 않습니다(`depositorName: null` 조건). 정상 입금완료로 저장된 이름을
   * 이후 요청이 지우는 것을 막기 위함입니다. 상태는 바꾸지 않으므로 라이프사이클 훅도 호출하지 않습니다.
   */
  private async recordDepositorClaim(orderId: string, depositorName: string): Promise<void> {
    const { count } = await this.prisma.order.updateMany({
      where: { id: orderId, depositorName: null },
      data: { depositorName },
    });
    if (count === 1) {
      LoggerUtil.log(
        `[OrderUserAction] 만료 취소된 주문에 입금자명 기록 - orderId: ${orderId}, depositorName: ${depositorName}`,
      );
    }
  }
}
