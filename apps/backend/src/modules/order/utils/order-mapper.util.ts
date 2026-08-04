import { Order, OrderItem } from "@apps/backend/infra/database/prisma/generated/client";
import {
  OrderItemResponseDto,
  OrderResponseDto,
} from "@apps/backend/modules/order/dto/order-detail.dto";
import {
  OrderMyReviewUiStatus,
  OrderStatus,
} from "@apps/backend/modules/order/constants/order.constants";
import { Prisma } from "@apps/backend/infra/database/prisma/generated/client";
import { refundCancellationPolicyFromDb } from "@apps/backend/modules/store/utils/store-refund-cancellation-policy.util";

/** 주문 응답에 실을 스토어 연락·정산·환불 규정 select (후기 등 동일 include와 공유) */
export const ORDER_RESPONSE_STORE_SELECT = {
  bankAccountNumber: true,
  bankName: true,
  accountHolderName: true,
  phoneNumber: true,
  kakaoChannelId: true,
  instagramId: true,
  refundCancellationPolicy: true,
} as const satisfies Prisma.StoreSelect;

/**
 * Prisma Order 엔티티 타입 (orderItems·연결 후기 id 포함)
 */
type OrderWithItems = Order & {
  orderItems: OrderItem[];
  review: { id: string; deletedAt: Date | null } | null;
  store: Prisma.StoreGetPayload<{ select: typeof ORDER_RESPONSE_STORE_SELECT }>;
};

/**
 * 주문 매핑 유틸리티
 * Prisma Order 및 OrderItem 엔티티를 응답 DTO로 변환하는 공통 로직을 제공합니다.
 */
export class OrderMapperUtil {
  /**
   * OrderItems select 필드
   * 주문 조회 시 orderItems를 포함하기 위한 공통 include 필드
   * (productName, productImages는 Order에 denormalized 저장됨)
   */
  static readonly ORDER_ITEMS_INCLUDE = {
    orderItems: true,
    review: {
      select: { id: true, deletedAt: true },
    },
    store: {
      select: ORDER_RESPONSE_STORE_SELECT,
    },
  } as const satisfies Prisma.OrderInclude;

  /**
   * 주문 상태·연결 후기(소프트 삭제 포함)로 사용자 후기 UI 상태 계산
   */
  static reviewUiFromOrder(
    order: Pick<Order, "orderStatus"> & {
      review: { id: string; deletedAt: Date | null } | null;
    },
  ): Pick<OrderResponseDto, "myReviewUiStatus" | "linkedProductReviewId"> {
    if (order.orderStatus !== OrderStatus.PICKUP_COMPLETED) {
      return {
        myReviewUiStatus: OrderMyReviewUiStatus.NOT_AVAILABLE,
        linkedProductReviewId: null,
      };
    }
    if (order.review) {
      if (order.review.deletedAt != null) {
        return {
          myReviewUiStatus: OrderMyReviewUiStatus.WITHDRAWN,
          linkedProductReviewId: null,
        };
      }
      return {
        myReviewUiStatus: OrderMyReviewUiStatus.WRITTEN,
        linkedProductReviewId: order.review.id,
      };
    }
    return {
      myReviewUiStatus: OrderMyReviewUiStatus.WRITABLE,
      linkedProductReviewId: null,
    };
  }

  /**
   * Prisma OrderItem 엔티티를 OrderItemResponseDto로 변환
   * @param orderItem - Prisma OrderItem 엔티티
   * @returns OrderItemResponseDto 객체
   */

  static mapToOrderItemResponse(orderItem: OrderItem): OrderItemResponseDto {
    return {
      id: orderItem.id,
      // 사이즈 옵션 정보
      sizeId: orderItem.sizeId ?? undefined,
      sizeDisplayName: orderItem.sizeDisplayName ?? undefined,
      sizeLengthCm: orderItem.sizeLengthCm ?? undefined,
      sizeDescription: orderItem.sizeDescription ?? undefined,
      sizePrice: orderItem.sizePrice ?? undefined,
      // 맛 옵션 정보
      flavorId: orderItem.flavorId ?? undefined,
      flavorDisplayName: orderItem.flavorDisplayName ?? undefined,
      flavorPrice: orderItem.flavorPrice ?? undefined,
      // 기타 옵션
      letteringMessage: orderItem.letteringMessage ?? undefined,
      requestMessage: orderItem.requestMessage ?? undefined,
      quantity: orderItem.quantity,
      itemPrice: orderItem.itemPrice,
      imageUrls: orderItem.imageUrls,
      createdAt: orderItem.createdAt,
      updatedAt: orderItem.updatedAt,
    } satisfies OrderItemResponseDto;
  }

  /**
   * Prisma Order 엔티티를 OrderResponseDto로 변환
   * @param order - Prisma Order 엔티티 (orderItems 포함)
   * @returns OrderResponseDto 객체
   */
  static mapToOrderResponse(order: OrderWithItems): OrderResponseDto {
    return {
      id: order.id,
      userId: order.consumerId,
      productId: order.productId,
      productName: order.productName ?? "",
      productImages: order.productImages ?? [],
      storeId: order.storeId,
      storeName: order.storeName ?? "",
      storePhoneNumber: order.store.phoneNumber ?? null,
      storeKakaoChannelId: order.store.kakaoChannelId ?? null,
      storeInstagramId: order.store.instagramId ?? null,
      storeBankName: order.store.bankName ?? null,
      storeBankAccountNumber: order.store.bankAccountNumber ?? null,
      storeAccountHolderName: order.store.accountHolderName ?? null,
      storeRefundCancellationPolicy: refundCancellationPolicyFromDb(
        order.store.refundCancellationPolicy,
      ),
      orderNumber: order.orderNumber,
      totalQuantity: order.totalQuantity,
      totalPrice: order.totalPrice,
      // 픽업 정보
      pickupDate: order.pickupDate ?? new Date(),
      pickupAddress: order.pickupAddress ?? "",
      pickupRoadAddress: order.pickupRoadAddress ?? "",
      pickupDetailAddress: order.pickupDetailAddress ?? "",
      pickupZonecode: order.pickupZonecode ?? "",
      pickupLatitude: order.pickupLatitude ?? 0,
      pickupLongitude: order.pickupLongitude ?? 0,
      orderStatus: order.orderStatus as OrderStatus,
      paymentPendingAt: order.paymentPendingAt ?? null,
      paymentPendingDeadlineAt: order.paymentPendingDeadlineAt ?? null,
      depositorName: order.depositorName ?? null,
      paymentPendingExpiredAt: order.paymentPendingExpiredAt ?? null,
      reservationContactName: order.reservationContactName ?? null,
      reservationPhone: order.reservationPhone ?? null,
      userCancelReason: order.userCancelReason ?? null,
      sellerCancelReason: order.sellerCancelReason ?? null,
      sellerNoShowReason: order.sellerNoShowReason ?? null,
      refundRequestReason: order.refundRequestReason ?? null,
      refundBankName: order.refundBankName ?? null,
      refundBankAccountNumber: order.refundBankAccountNumber ?? null,
      refundAccountHolderName: order.refundAccountHolderName ?? null,
      sellerCancelRefundPendingReason: order.sellerCancelRefundPendingReason ?? null,
      adminRefundRevertReason: order.adminRefundRevertReason ?? null,
      adminRefundRevertedAt: order.adminRefundRevertedAt ?? null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      orderItems: order.orderItems.map((item) => this.mapToOrderItemResponse(item)),
      ...this.reviewUiFromOrder(order),
    } satisfies OrderResponseDto;
  }
}
