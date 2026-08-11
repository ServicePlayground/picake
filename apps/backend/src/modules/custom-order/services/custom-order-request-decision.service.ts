import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import { LoggerUtil } from "@apps/backend/common/utils/logger.util";
import { ChatMessageCreateService } from "@apps/backend/modules/chat/services/chat-message-create.service";
import { OrderLifecycleHookService } from "@apps/backend/modules/order/services/order-lifecycle-hook.service";
import { OrderStatus } from "@apps/backend/modules/order/constants/order.constants";
import { ORDER_STATUS_TRANSITION_SOURCE } from "@apps/backend/modules/order/types/order-lifecycle.types";
import { computePaymentPendingDeadline } from "@apps/backend/modules/order/utils/order-datetime.util";
import {
  generateUniqueOrderNumber,
  getTodayUtcRange,
} from "@apps/backend/modules/order/utils/order-number.util";
import { isPickupAllowedForStore } from "@apps/backend/modules/order/utils/order-store-business-calendar.util";
import {
  CUSTOM_ORDER_ERROR_MESSAGES,
  CUSTOM_ORDER_MESSAGES,
} from "../constants/custom-order.constants";

/**
 * 견적 승인/거절 서비스 (구매자)
 *
 * 승인 시 판매자가 이미 견적으로 예약을 승인한 것이므로 예약신청 단계를 건너뛰고
 * 곧바로 입금대기(PAYMENT_PENDING) 주문을 생성합니다. 기존 입금기한 계산과 상태 전환 훅을
 * 그대로 태워 입금 안내 알림톡이 자동 발송됩니다.
 */
@Injectable()
export class CustomOrderRequestDecisionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly chatMessageCreateService: ChatMessageCreateService,
    private readonly orderLifecycleHookService: OrderLifecycleHookService,
  ) {}

  async accept(requestId: string, consumerId: string) {
    const request = await this.prisma.customOrderRequest.findUnique({
      where: { id: requestId },
      include: { product: { include: { store: true } } },
    });
    if (!request) throw new NotFoundException(CUSTOM_ORDER_ERROR_MESSAGES.REQUEST_NOT_FOUND);
    if (request.consumerId !== consumerId) {
      throw new ForbiddenException(CUSTOM_ORDER_ERROR_MESSAGES.REQUEST_NOT_OWNED);
    }
    if (request.status !== "QUOTED" || request.quotedPrice === null) {
      throw new BadRequestException(CUSTOM_ORDER_ERROR_MESSAGES.INVALID_STATUS_FOR_DECISION);
    }

    // 승인은 요청 생성 며칠 뒤일 수 있으므로 픽업 일시를 재검증한다
    const now = new Date();
    if (request.desiredDate.getTime() <= now.getTime()) {
      throw new BadRequestException(CUSTOM_ORDER_ERROR_MESSAGES.PICKUP_DATE_PASSED);
    }
    if (!isPickupAllowedForStore(request.desiredDate, request.product.store)) {
      throw new BadRequestException(CUSTOM_ORDER_ERROR_MESSAGES.PICKUP_OUTSIDE_BUSINESS_HOURS);
    }

    const { product } = request;
    const { store } = product;
    const quotedPrice = request.quotedPrice;
    const paymentPendingDeadlineAt = computePaymentPendingDeadline(now, request.desiredDate);

    // 주문 생성 + 상태 전이를 하나의 트랜잭션으로 (이중 클릭/동시 요청 시 이중 주문 방지)
    const created = await generateUniqueOrderNumber(
      async (orderNumber) =>
      this.prisma.$transaction(
        async (tx) => {
          // 조건부 원자 업데이트 — QUOTED일 때만 성공
          const claimed = await tx.customOrderRequest.updateMany({
            where: { id: requestId, status: "QUOTED" },
            data: { status: "ACCEPTED" },
          });
          if (claimed.count === 0) {
            throw new BadRequestException(CUSTOM_ORDER_ERROR_MESSAGES.ALREADY_PROCESSED);
          }

          const order = await tx.order.create({
            data: {
              consumerId,
              productId: product.id,
              productName: product.name,
              productImages: product.images,
              storeId: store.id,
              storeName: store.name,
              orderNumber,
              totalQuantity: request.quantity,
              totalPrice: quotedPrice,
              pickupDate: request.desiredDate,
              pickupAddress: store.address ?? "",
              pickupRoadAddress: store.roadAddress ?? "",
              pickupDetailAddress: store.detailAddress ?? "",
              pickupZonecode: store.zonecode ?? "",
              pickupLatitude: store.latitude ?? 0,
              pickupLongitude: store.longitude ?? 0,
              reservationContactName: request.reservationContactName,
              reservationPhone: request.reservationPhone,
              // 판매자가 견적을 제시한 것이 예약 승인이므로 예약신청 단계를 건너뛴다
              orderStatus: OrderStatus.PAYMENT_PENDING,
              paymentPendingAt: now,
              paymentPendingDeadlineAt,
              orderItems: {
                create: {
                  quantity: request.quantity,
                  itemPrice: quotedPrice,
                  requestMessage: request.requirementsText,
                  imageUrls: request.images,
                },
              },
            },
          });

          await tx.customOrderRequest.update({
            where: { id: requestId },
            data: { orderId: order.id },
          });

          return order;
        },
        { maxWait: 5000, timeout: 10000 },
      ),
      async () => {
        const { startOfDay, endOfDay } = getTodayUtcRange();
        return await this.prisma.order.count({
          where: { createdAt: { gte: startOfDay, lte: endOfDay } },
        });
      },
    );

    // 입금 안내 알림톡 자동 발송 (기존 상태 전환 훅 재사용)
    this.orderLifecycleHookService.afterOrderStatusTransition({
      orderId: created.id,
      fromStatus: null,
      toStatus: OrderStatus.PAYMENT_PENDING,
      source: ORDER_STATUS_TRANSITION_SOURCE.ORDER_CREATE,
    });

    await this.chatMessageCreateService.sendSystemMessage(
      request.roomId,
      CUSTOM_ORDER_MESSAGES.ACCEPTED,
      { relatedCustomOrderRequestId: request.id },
    );

    LoggerUtil.log(
      `커스텀 주문 승인 - requestId: ${requestId}, orderId: ${created.id}, totalPrice: ${quotedPrice}`,
    );

    return { orderId: created.id, status: "ACCEPTED" as const };
  }

  async decline(requestId: string, consumerId: string) {
    const request = await this.prisma.customOrderRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new NotFoundException(CUSTOM_ORDER_ERROR_MESSAGES.REQUEST_NOT_FOUND);
    if (request.consumerId !== consumerId) {
      throw new ForbiddenException(CUSTOM_ORDER_ERROR_MESSAGES.REQUEST_NOT_OWNED);
    }

    const result = await this.prisma.customOrderRequest.updateMany({
      where: { id: requestId, status: "QUOTED" },
      data: { status: "DECLINED" },
    });
    if (result.count === 0) {
      throw new BadRequestException(CUSTOM_ORDER_ERROR_MESSAGES.INVALID_STATUS_FOR_DECISION);
    }

    await this.chatMessageCreateService.sendSystemMessage(
      request.roomId,
      CUSTOM_ORDER_MESSAGES.DECLINED,
      { relatedCustomOrderRequestId: request.id },
    );

    return { id: requestId, status: "DECLINED" as const };
  }
}
