import { OrderStatus } from "@apps/backend/modules/order/constants/order.constants";
import type { OrderStatusTransitionPayload } from "@apps/backend/modules/order/types/order-lifecycle.types";
import {
  isPaymentExpiredCancelSource,
  isReservationRequestedOnCreate,
  isSellerStatusUpdate,
  isUserAction,
} from "@apps/backend/modules/notification/utils/user-order-notification-transition.util";

export type UserOrderNotificationCopy = { title: string; body: string };

/**
 * 구매자(USER) 주문 알림 문구.
 *
 * **서비스 주문 흐름(코드 기준 요약)**
 * 1. 주문 제출 → `RESERVATION_REQUESTED`(예약신청): 스토어 확인 대기
 * 2. 스토어가 확인 → `PAYMENT_PENDING`(입금대기): 계좌 안내, 픽업 일정에 따라 정해진 마감까지 입금(`order-automation`)
 * 3. 사용자가 앱에서 입금 완료 처리 → `PAYMENT_COMPLETED`: 본인 액션이라 알림 생략(null)
 * 4. 스토어가 → `CONFIRMED`(예약확정): 입금대기·입금완료 어느 쪽에서든 전환 가능
 * 5. 픽업 24시간 전 → 픽업 안내(알림톡·푸시). 주문~픽업이 24시간 미만이면 생략
 * 6. 픽업 일시 도래 → 자동으로 `PICKUP_PENDING`(픽업대기). 구매자 알림은 5번에서 이미 발송
 * 7. 스토어가 → `PICKUP_COMPLETED`(픽업완료)
 *
 * 취소·환불·노쇼는 아래 분기에서 처리합니다.
 */
export function buildUserOrderNotificationCopy(
  payload: Pick<OrderStatusTransitionPayload, "fromStatus" | "toStatus" | "source">,
): UserOrderNotificationCopy | null {
  const { toStatus } = payload;

  if (isReservationRequestedOnCreate(payload)) {
    return {
      title: "예약 신청이 접수되었어요",
      body: "스토어에 주문이 전달되었어요. 스토어가 확인하면 다음 안내를 알려드릴게요. 진행 상황은 마이페이지 내 예약에서도 볼 수 있어요.",
    };
  }

  if (toStatus === OrderStatus.PAYMENT_PENDING) {
    return {
      title: "이제 입금해 주세요",
      body: "스토어가 예약을 확인했어요. 주문에 표시된 계좌로 입금해 주세요. 입금 마감은 주문 화면에 표시된 시각까지이며, 픽업 일정에 따라 더 짧을 수 있어요. 마감이 지나면 주문이 자동으로 취소될 수 있어요.",
    };
  }

  if (toStatus === OrderStatus.PAYMENT_COMPLETED) {
    return null;
  }

  if (toStatus === OrderStatus.CONFIRMED) {
    return {
      title: "예약이 확정되었어요",
      body: "픽업 날짜와 시간을 한 번 더 확인해 주세요. 픽업 하루 전에는 픽업 안내 알림이 갈 수 있어요.",
    };
  }

  // 픽업대기 자동 전환 시점의 구매자 알림은 픽업 24시간 전 안내로 대체
  if (toStatus === OrderStatus.PICKUP_PENDING) {
    return null;
  }

  if (toStatus === OrderStatus.PICKUP_COMPLETED) {
    return {
      title: "픽업이 완료되었어요",
      body: "이용해 주셔서 감사해요. 주문이 정상적으로 마무리되었어요.",
    };
  }

  if (toStatus === OrderStatus.CANCEL_COMPLETED) {
    if (isPaymentExpiredCancelSource(payload)) {
      return {
        title: "입금 시간이 지나 주문이 취소되었어요",
        body: "입금 마감 시간 안에 입금이 확인되지 않아 예약이 취소되었어요. 다시 이용하시려면 상품에서 새로 주문해 주세요.",
      };
    }
    if (isUserAction(payload)) {
      return {
        title: "주문 취소가 완료되었어요",
        body: "요청하신 대로 취소 처리되었어요.",
      };
    }
    if (isSellerStatusUpdate(payload)) {
      return {
        title: "스토어에서 주문이 취소되었어요",
        body: "스토어 사정으로 예약을 진행할 수 없어 주문이 취소되었어요. 자세한 내용은 주문 상세를 확인하거나 스토어에 문의해 주세요.",
      };
    }
    return null;
  }

  if (toStatus === OrderStatus.CANCEL_REFUND_PENDING) {
    if (isUserAction(payload)) {
      return {
        title: "취소·환불 요청을 보냈어요",
        body: "스토어에서 확인한 뒤 처리해요. 결과는 알림과 주문 화면에서 안내드릴게요.",
      };
    }
    if (isSellerStatusUpdate(payload)) {
      return {
        title: "취소·환불을 진행 중이에요",
        body: "스토어에서 환불 절차를 진행하고 있어요. 진행 상황은 주문 상세에서 확인할 수 있어요.",
      };
    }
    return null;
  }

  if (toStatus === OrderStatus.CANCEL_REFUND_COMPLETED) {
    return {
      title: "환불이 완료되었어요",
      body: "환불 처리 내역은 주문 상세에서 확인할 수 있어요.",
    };
  }

  if (toStatus === OrderStatus.NO_SHOW) {
    return {
      title: "픽업이 확인되지 않았어요",
      body: "예약된 픽업이 이루어지지 않은 것으로 처리되었어요. 오인이면 스토어에 연락해 주세요.",
    };
  }

  return null;
}

/** 픽업 24시간 전 구매자 인앱·푸시 문구 */
export function buildPickupReminderNotificationCopy(): UserOrderNotificationCopy {
  return {
    title: "내일 픽업이에요",
    body: "예약하신 상품을 내일 픽업하는 날이에요. 시간에 맞춰 방문해 주세요.",
  };
}
