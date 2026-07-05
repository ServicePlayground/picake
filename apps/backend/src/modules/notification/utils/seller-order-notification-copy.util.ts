import { OrderStatus } from "@apps/backend/modules/order/constants/order.constants";
import type { OrderStatusTransitionPayload } from "@apps/backend/modules/order/types/order-lifecycle.types";
import {
  isPaymentExpiredCancelSource,
  isReservationRequestedOnCreate,
  isSellerStatusUpdate,
  isUserAction,
} from "@apps/backend/modules/notification/utils/user-order-notification-transition.util";

export type OrderNotificationCopy = { title: string; body: string };

/**
 * 주문 상태 전환 payload를 바로 받아 문구를 결정합니다.
 * - kind/event 같은 중간 식별자는 사용하지 않습니다.
 */
export function buildSellerOrderNotificationCopy(
  payload: Pick<OrderStatusTransitionPayload, "fromStatus" | "toStatus" | "source">,
): OrderNotificationCopy | null {
  const { toStatus } = payload;

  if (isReservationRequestedOnCreate(payload)) {
    return {
      title: "예약 신청이 들어왔습니다",
      body: "고객이 주문을 신청했습니다. 예약을 확인해 주세요.",
    };
  }

  if (toStatus === OrderStatus.PAYMENT_PENDING) {
    return {
      title: "입금 대기 안내가 전달되었습니다",
      body: "예약 확인으로 바꾸면서 고객에게 입금 안내가 갔습니다.",
    };
  }

  if (toStatus === OrderStatus.PAYMENT_COMPLETED) {
    return {
      title: "입금이 완료되었습니다",
      body: "고객이 입금 확인 처리했습니다. 이어서 진행해 주세요.",
    };
  }

  if (toStatus === OrderStatus.CONFIRMED) {
    return {
      title: "예약이 확정되었습니다",
      body: "주문이 예약 확정 상태입니다. 픽업 일정을 확인해 주세요.",
    };
  }

  if (toStatus === OrderStatus.PICKUP_PENDING) {
    return {
      title: "픽업 대기입니다",
      body: "픽업 준비가 되었습니다. 픽업 완료 여부를 확인해 주세요.",
    };
  }

  if (toStatus === OrderStatus.PICKUP_COMPLETED) {
    return {
      title: "픽업이 완료되었습니다",
      body: "픽업 완료로 처리했습니다.",
    };
  }

  if (toStatus === OrderStatus.CANCEL_COMPLETED) {
    if (isPaymentExpiredCancelSource(payload)) {
      return {
        title: "입금 기한이 지나 주문이 취소되었습니다",
        body: "입금 대기 시간이 만료되어 취소 처리되었습니다.",
      };
    }
    if (isUserAction(payload)) {
      return {
        title: "고객이 주문을 취소했습니다",
        body: "고객 취소가 반영되었습니다.",
      };
    }
    if (isSellerStatusUpdate(payload)) {
      return {
        title: "판매자 취소가 반영되었습니다",
        body: "주문이 취소 처리되었습니다.",
      };
    }
    return null;
  }

  if (toStatus === OrderStatus.CANCEL_REFUND_PENDING) {
    if (isUserAction(payload)) {
      return {
        title: "고객이 환불을 요청했습니다",
        body: "취소·환불 대기로 접수되었습니다. 내용을 확인해 주세요.",
      };
    }
    if (isSellerStatusUpdate(payload)) {
      return {
        title: "환불 대기로 변경했습니다",
        body: "취소·환불 대기 상태입니다. 고객 안내와 환불 처리를 진행해 주세요.",
      };
    }
    return null;
  }

  if (toStatus === OrderStatus.CANCEL_REFUND_COMPLETED) {
    return {
      title: "환불이 완료되었습니다",
      body: "환불 처리가 완료되었습니다.",
    };
  }

  if (toStatus === OrderStatus.NO_SHOW) {
    return {
      title: "노쇼 처리되었습니다",
      body: "노쇼로 기록된 주문입니다.",
    };
  }

  return null;
}
