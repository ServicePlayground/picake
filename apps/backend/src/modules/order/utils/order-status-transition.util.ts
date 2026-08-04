import { OrderStatus } from "@apps/backend/modules/order/constants/order.constants";

/**
 * 판매자 PATCH로 설정 가능한 목표 상태
 */
export const SELLER_SETTABLE_ORDER_STATUSES: ReadonlySet<OrderStatus> = new Set([
  OrderStatus.PAYMENT_PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PICKUP_COMPLETED,
  OrderStatus.NO_SHOW,
  OrderStatus.CANCEL_COMPLETED,
  OrderStatus.CANCEL_REFUND_PENDING,
  OrderStatus.CANCEL_REFUND_COMPLETED,
]);

/** 입금대기(PAYMENT_PENDING) — 판매자가 예약신청(RESERVATION_REQUESTED)을 확인한 뒤에만 설정 */
export const SELLER_PAYMENT_PENDING_ALLOWED_FROM_STATUSES: ReadonlySet<OrderStatus> = new Set([
  OrderStatus.RESERVATION_REQUESTED,
]);

/** 예약확정(CONFIRMED) — 입금대기(입금 전 확정) 또는 입금완료 후 */
export const SELLER_CONFIRMED_ALLOWED_FROM_STATUSES: ReadonlySet<OrderStatus> = new Set([
  OrderStatus.PAYMENT_PENDING,
  OrderStatus.PAYMENT_COMPLETED,
]);

/** 픽업완료(PICKUP_COMPLETED)로 바꿀 때만 허용되는 현재 상태 */
export const SELLER_PICKUP_COMPLETED_ALLOWED_FROM_STATUSES: ReadonlySet<OrderStatus> = new Set([
  OrderStatus.CONFIRMED,
  OrderStatus.PICKUP_PENDING,
]);

/** 노쇼 — 픽업대기(고객 미수령)에서만 판매자가 설정 */
export const SELLER_NO_SHOW_ALLOWED_FROM_STATUSES: ReadonlySet<OrderStatus> = new Set([
  OrderStatus.PICKUP_PENDING,
]);

/** 취소완료 — 판매자가 예약신청·입금대기에서 예약 취소 */
export const SELLER_CANCEL_COMPLETED_ALLOWED_FROM_STATUSES: ReadonlySet<OrderStatus> = new Set([
  OrderStatus.RESERVATION_REQUESTED,
  OrderStatus.PAYMENT_PENDING,
]);

/** 취소환불대기 — 입금 이후 플로우(사용자 취소·환불 요청 또는 판매자 PATCH). 판매자 전환 시 사유는 `sellerCancelRefundPendingReason` */
export const SELLER_CANCEL_REFUND_PENDING_ALLOWED_FROM_STATUSES: ReadonlySet<OrderStatus> = new Set(
  [OrderStatus.PAYMENT_COMPLETED, OrderStatus.CONFIRMED, OrderStatus.PICKUP_PENDING],
);

/** 취소환불완료 — 취소환불대기에서만 */
export const SELLER_CANCEL_REFUND_COMPLETED_ALLOWED_FROM_STATUSES: ReadonlySet<OrderStatus> =
  new Set([OrderStatus.CANCEL_REFUND_PENDING]);

/** 사용자가 취소환불대기(취소·환불 요청)로 갈 수 있는 상태 (입금 완료 이후) */
export const USER_CANCEL_REFUND_REQUEST_SOURCE_STATUSES: ReadonlySet<OrderStatus> = new Set([
  OrderStatus.PAYMENT_COMPLETED,
  OrderStatus.CONFIRMED,
  OrderStatus.PICKUP_PENDING,
]);

/**
 * 관리자가 취소환불대기로 "되돌릴" 수 있는 상태.
 *
 * 취소완료(CANCEL_COMPLETED)는 원래 나가는 경로가 없는 종착 상태입니다. 그런데 무통장입금이라
 * 서버는 입금 여부를 알 수 없어, 실제로 입금한 손님이 (직접 취소·판매자 취소·기한 만료 자동 취소로)
 * 이 상태에 빠지면 환불을 처리할 수단이 없습니다. 그 예외 구제 경로를 관리자에게만 엽니다.
 *
 * 판매자·사용자에게는 열지 않습니다 — 종착 상태를 되돌리는 것은 강한 권한이라 관리자가 통제하고,
 * 실제 환불 송금은 되돌린 뒤 기존 취소환불대기 플로우에서 판매자가 집행합니다.
 */
export const ADMIN_REVERT_TO_REFUND_PENDING_ALLOWED_FROM_STATUSES: ReadonlySet<OrderStatus> =
  new Set([OrderStatus.CANCEL_COMPLETED]);

export function isAdminRevertToRefundPendingAllowed(from: OrderStatus): boolean {
  return ADMIN_REVERT_TO_REFUND_PENDING_ALLOWED_FROM_STATUSES.has(from);
}

/** 입금 전 사용자 취소 가능 상태 (예약신청·입금대기) */
export const ORDER_PRE_PAYMENT_WINDOW_STATUSES: ReadonlySet<OrderStatus> = new Set([
  OrderStatus.RESERVATION_REQUESTED,
  OrderStatus.PAYMENT_PENDING,
]);

/** 예약신청 단계에서만 사용자가 픽업일·주문 항목(옵션)을 수정할 수 있음 */
export const RESERVATION_USER_EDIT_ALLOWED_STATUSES: ReadonlySet<OrderStatus> = new Set([
  OrderStatus.RESERVATION_REQUESTED,
]);

export function isSellerSettableOrderStatus(status: OrderStatus): boolean {
  return SELLER_SETTABLE_ORDER_STATUSES.has(status);
}

/**
 * 판매자 상태 변경 허용 여부.
 * 취소완료·노쇼·취소환불대기(판매자 전환) 시 사유는 서비스 레이어에서 `sellerCancelReason`·`sellerNoShowReason`·`sellerCancelRefundPendingReason`으로 검증합니다.
 */
export function isSellerTransitionAllowed(from: OrderStatus, to: OrderStatus): boolean {
  if (!isSellerSettableOrderStatus(to)) {
    return false;
  }
  if (
    to === OrderStatus.PAYMENT_PENDING &&
    !SELLER_PAYMENT_PENDING_ALLOWED_FROM_STATUSES.has(from)
  ) {
    return false;
  }
  if (to === OrderStatus.CONFIRMED && !SELLER_CONFIRMED_ALLOWED_FROM_STATUSES.has(from)) {
    return false;
  }
  if (
    to === OrderStatus.PICKUP_COMPLETED &&
    !SELLER_PICKUP_COMPLETED_ALLOWED_FROM_STATUSES.has(from)
  ) {
    return false;
  }
  if (to === OrderStatus.NO_SHOW && !SELLER_NO_SHOW_ALLOWED_FROM_STATUSES.has(from)) {
    return false;
  }
  if (
    to === OrderStatus.CANCEL_COMPLETED &&
    !SELLER_CANCEL_COMPLETED_ALLOWED_FROM_STATUSES.has(from)
  ) {
    return false;
  }
  if (
    to === OrderStatus.CANCEL_REFUND_PENDING &&
    !SELLER_CANCEL_REFUND_PENDING_ALLOWED_FROM_STATUSES.has(from)
  ) {
    return false;
  }
  if (
    to === OrderStatus.CANCEL_REFUND_COMPLETED &&
    !SELLER_CANCEL_REFUND_COMPLETED_ALLOWED_FROM_STATUSES.has(from)
  ) {
    return false;
  }
  return true;
}
