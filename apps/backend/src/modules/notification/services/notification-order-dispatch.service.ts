import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import type { OrderStatusTransitionPayload } from "@apps/backend/modules/order/types/order-lifecycle.types";
import { buildSellerOrderNotificationCopy } from "@apps/backend/modules/notification/utils/seller-order-notification-copy.util";
import { buildUserOrderNotificationCopy } from "@apps/backend/modules/notification/utils/user-order-notification-copy.util";
import {
  buildUserOrderAlimtalkPayload,
  type UserOrderAlimtalkOrderInfo,
} from "@apps/backend/modules/notification/utils/user-order-alimtalk.util";
import { NotificationService } from "@apps/backend/modules/notification/services/notification.service";
import { NotificationGateway } from "@apps/backend/modules/notification/gateways/notification.gateway";
import { ConsumerOrderFcmPushService } from "@apps/backend/modules/fcm/services/consumer-order-fcm-push.service";
import { ConsumerOrderAlimtalkService } from "@apps/backend/modules/solapi/services/consumer-order-alimtalk.service";
import { LoggerUtil } from "@apps/backend/common/utils/logger.util";
import { SentryUtil } from "@apps/backend/common/utils/sentry.util";

const USER_ORDER_NOTIFICATION_SELECT = {
  consumerId: true,
  storeId: true,
  orderNumber: true,
  storeName: true,
  productName: true,
  totalPrice: true,
  pickupDate: true,
  pickupRoadAddress: true,
  pickupAddress: true,
  pickupDetailAddress: true,
  pickupLatitude: true,
  pickupLongitude: true,
  paymentPendingDeadlineAt: true,
  sellerCancelReason: true,
  sellerCancelRefundPendingReason: true,
  reservationPhone: true,
  consumer: { select: { phone: true, name: true } },
  store: {
    select: { bankName: true, bankAccountNumber: true, accountHolderName: true },
  },
} as const;

/**
 * 주문 라이프사이클 훅에서 호출되어, 판매자·구매자 주문 알림을 처리합니다.
 *
 * 구매자 알림 발송 흐름:
 *   1. DB 저장 (UserNotification)
 *   2. Socket.IO 실시간 발송 → 앱 내 WebView가 포그라운드인 경우 즉시 수신
 *   3. FCM 푸시 발송       → 앱이 백그라운드이거나 종료된 경우 Flutter가 시스템 알림으로 표시
 *   4. 카카오 알림톡 발송   → 앱 미설치·미접속 사용자에게도 도달 (등록된 템플릿이 있는 상태만)
 */
@Injectable()
export class NotificationOrderDispatchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly notificationService: NotificationService,
    private readonly notificationGateway: NotificationGateway,
    private readonly consumerOrderFcmPushService: ConsumerOrderFcmPushService,
    private readonly consumerOrderAlimtalkService: ConsumerOrderAlimtalkService,
  ) {}

  async handleOrderStatusTransition(payload: OrderStatusTransitionPayload): Promise<void> {
    await this.dispatchSellerOrderNotification(payload);
    await this.dispatchUserOrderNotification(payload);
  }

  /**
   * 스토어 소유 판매자에게 SELLER_WEB 주문 알림 (설정 반영).
   */
  private async dispatchSellerOrderNotification(
    payload: OrderStatusTransitionPayload,
  ): Promise<void> {
    try {
      const copy = buildSellerOrderNotificationCopy(payload);
      if (!copy) return;

      const order = await this.prisma.order.findUnique({
        where: { id: payload.orderId },
        select: {
          storeId: true,
          store: { select: { sellerId: true } },
        },
      });
      if (!order?.store?.sellerId) return;

      const sellerUserId = order.store.sellerId;
      const prefs = await this.notificationService.getOrCreatePreferenceSellerWeb(
        sellerUserId,
        order.storeId,
      );
      if (!prefs.orderNotificationsEnabled) return;

      const item = await this.notificationService.createSellerWebOrderNotification({
        recipientUserId: sellerUserId,
        title: copy.title,
        body: copy.body,
        storeId: order.storeId,
        orderId: payload.orderId,
      });

      this.notificationGateway.emitSellerNotification(sellerUserId, item);
    } catch (e) {
      LoggerUtil.log(
        `[NotificationOrderDispatch/seller] 실패 order=${payload.orderId}: ${e instanceof Error ? e.message : String(e)}`,
      );
      SentryUtil.captureException(e, "error", {
        module: "notification-order-dispatch",
        channel: "seller",
        orderId: payload.orderId,
        source: payload.source,
      });
    }
  }

  /**
   * 구매자에게 USER_WEB 주문 알림을 발송합니다.
   *
   * - Socket.IO: 앱 내 WebView가 포그라운드일 때 즉시 수신
   * - FCM 푸시: 앱이 백그라운드·종료 상태일 때 Flutter가 시스템 알림으로 표시
   * - 카카오 알림톡: 앱 미설치·미접속 사용자에게도 도달 (등록된 템플릿이 있는 상태만)
   */
  private async dispatchUserOrderNotification(
    payload: OrderStatusTransitionPayload,
  ): Promise<void> {
    try {
      const copy = buildUserOrderNotificationCopy(payload);

      const order = await this.prisma.order.findUnique({
        where: { id: payload.orderId },
        select: USER_ORDER_NOTIFICATION_SELECT,
      });
      if (!order) return;

      const alimtalk = buildUserOrderAlimtalkPayload(
        payload,
        this.toAlimtalkOrderInfo(order, payload.orderId),
      );
      if (!copy && !alimtalk) return;

      if (copy) {
        const item = await this.notificationService.createUserWebOrderNotification({
          recipientUserId: order.consumerId,
          title: copy.title,
          body: copy.body,
          storeId: order.storeId,
          orderId: payload.orderId,
        });

        this.notificationGateway.emitUserOrderNotification(order.consumerId, item);

        const prefs = await this.notificationService.getOrCreatePreferenceUserWeb(order.consumerId);
        if (prefs.pushNotificationsEnabled) {
          await this.consumerOrderFcmPushService.sendOrderPush({
            consumerId: order.consumerId,
            title: copy.title,
            body: copy.body,
            orderId: payload.orderId,
          });
        }
      }

      if (alimtalk) {
        const recipientPhone = order.reservationPhone ?? order.consumer.phone;
        if (recipientPhone) {
          await this.consumerOrderAlimtalkService.sendOrderAlimtalk({
            to: recipientPhone,
            templateId: alimtalk.templateId,
            variables: alimtalk.variables,
            orderId: payload.orderId,
          });
        }
      }
    } catch (e) {
      LoggerUtil.log(
        `[NotificationOrderDispatch/user] 실패 order=${payload.orderId}: ${e instanceof Error ? e.message : String(e)}`,
      );
      SentryUtil.captureException(e, "error", {
        module: "notification-order-dispatch",
        channel: "user",
        orderId: payload.orderId,
        source: payload.source,
      });
    }
  }

  private toAlimtalkOrderInfo(
    order: {
      orderNumber: string;
      storeName: string | null;
      productName: string | null;
      totalPrice: number;
      pickupDate: Date | null;
      pickupRoadAddress: string | null;
      pickupAddress: string | null;
      pickupDetailAddress: string | null;
      pickupLatitude: number | null;
      pickupLongitude: number | null;
      paymentPendingDeadlineAt: Date | null;
      sellerCancelReason: string | null;
      sellerCancelRefundPendingReason: string | null;
      consumer: { name: string | null };
      store: {
        bankName: string | null;
        bankAccountNumber: string | null;
        accountHolderName: string | null;
      } | null;
    },
    orderId: string,
  ): UserOrderAlimtalkOrderInfo {
    return {
      publicUserDomain: this.configService.get<string>("PUBLIC_USER_DOMAIN") ?? "",
      orderId,
      orderNumber: order.orderNumber,
      storeName: order.storeName,
      consumerName: order.consumer.name,
      productName: order.productName,
      totalPrice: order.totalPrice,
      pickupDate: order.pickupDate,
      pickupRoadAddress: order.pickupRoadAddress,
      pickupAddress: order.pickupAddress,
      pickupDetailAddress: order.pickupDetailAddress,
      pickupLatitude: order.pickupLatitude,
      pickupLongitude: order.pickupLongitude,
      paymentPendingDeadlineAt: order.paymentPendingDeadlineAt,
      storeBankName: order.store?.bankName ?? null,
      storeBankAccountNumber: order.store?.bankAccountNumber ?? null,
      storeAccountHolderName: order.store?.accountHolderName ?? null,
      sellerCancelReason: order.sellerCancelReason,
      sellerCancelRefundPendingReason: order.sellerCancelRefundPendingReason,
    };
  }
}
