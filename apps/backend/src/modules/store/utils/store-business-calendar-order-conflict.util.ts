import { OrderStatus } from "@apps/backend/modules/order/constants/order.constants";
import {
  getSeoulWallClockForPickup,
  pickupFitsBusinessCalendarState,
  type StoreBusinessCalendarState,
} from "@apps/backend/modules/store/utils/store-business-calendar.util";

/** 영업 캘린더 변경 시 픽업 의무가 남아 있는 주문 상태 */
export const STORE_BUSINESS_CALENDAR_BLOCKING_ORDER_STATUSES: readonly OrderStatus[] = [
  OrderStatus.RESERVATION_REQUESTED,
  OrderStatus.PAYMENT_PENDING,
  OrderStatus.PAYMENT_COMPLETED,
  OrderStatus.CONFIRMED,
  OrderStatus.PICKUP_PENDING,
] as const;

const BLOCKING_STATUS_SET = new Set<OrderStatus>(STORE_BUSINESS_CALENDAR_BLOCKING_ORDER_STATUSES);

const ORDER_STATUS_LABELS_KO: Record<OrderStatus, string> = {
  [OrderStatus.RESERVATION_REQUESTED]: "예약신청",
  [OrderStatus.PAYMENT_PENDING]: "입금대기",
  [OrderStatus.PAYMENT_COMPLETED]: "입금완료",
  [OrderStatus.CONFIRMED]: "예약확정",
  [OrderStatus.PICKUP_PENDING]: "픽업대기",
  [OrderStatus.PICKUP_COMPLETED]: "픽업완료",
  [OrderStatus.CANCEL_COMPLETED]: "취소완료",
  [OrderStatus.CANCEL_REFUND_PENDING]: "취소환불대기",
  [OrderStatus.CANCEL_REFUND_COMPLETED]: "취소환불완료",
  [OrderStatus.NO_SHOW]: "노쇼",
};

export type StoreBusinessCalendarOrderConflict = {
  orderId: string;
  orderNumber: string;
  orderStatus: OrderStatus;
  pickupDate: string;
  pickupDateSeoulKey: string;
  pickupTimeSeoul: string;
};

function formatSeoulHmFromMinuteOfDay(minuteOfDay: number): string {
  const h = Math.floor(minuteOfDay / 60);
  const m = minuteOfDay % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function findStoreBusinessCalendarOrderConflicts(
  proposedState: StoreBusinessCalendarState,
  orders: ReadonlyArray<{
    id: string;
    orderNumber: string;
    orderStatus: string;
    pickupDate: Date | null;
  }>,
): StoreBusinessCalendarOrderConflict[] {
  const conflicts: StoreBusinessCalendarOrderConflict[] = [];

  for (const order of orders) {
    const status = order.orderStatus as OrderStatus;
    if (!BLOCKING_STATUS_SET.has(status)) continue;
    if (!order.pickupDate) continue;
    if (pickupFitsBusinessCalendarState(order.pickupDate, proposedState)) continue;

    const { dateKey, minuteOfDay } = getSeoulWallClockForPickup(order.pickupDate);
    conflicts.push({
      orderId: order.id,
      orderNumber: order.orderNumber,
      orderStatus: status,
      pickupDate: order.pickupDate.toISOString(),
      pickupDateSeoulKey: dateKey,
      pickupTimeSeoul: formatSeoulHmFromMinuteOfDay(minuteOfDay),
    });
  }

  conflicts.sort(
    (a, b) =>
      a.pickupDate.localeCompare(b.pickupDate) || a.orderNumber.localeCompare(b.orderNumber),
  );
  return conflicts;
}

export function formatStoreBusinessCalendarConflictMessage(
  conflicts: readonly StoreBusinessCalendarOrderConflict[],
): string {
  if (conflicts.length === 0) return "";

  const lines = [
    `진행 중인 예약 ${conflicts.length}건과 영업 설정이 맞지 않아 저장할 수 없습니다.`,
    "",
    ...conflicts
      .slice(0, 5)
      .map(
        (c) =>
          `· ${c.pickupDateSeoulKey} ${c.pickupTimeSeoul} ${ORDER_STATUS_LABELS_KO[c.orderStatus]} (${c.orderNumber})`,
      ),
  ];

  if (conflicts.length > 5) {
    lines.push(`· 외 ${conflicts.length - 5}건`);
  }

  lines.push("", "해당 예약을 취소하거나 영업 시간을 조정한 뒤 다시 저장해 주세요.");
  return lines.join("\n");
}
