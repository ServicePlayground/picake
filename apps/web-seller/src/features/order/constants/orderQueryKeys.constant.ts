import type { OrderListQueryParams } from "@/apps/web-seller/features/order/types/order.ui";

/**
 * Order 관련 쿼리 키 상수
 */
export const orderQueryKeys = {
  all: ["order"] as const,
  lists: () => ["order", "list"] as const,
  list: (params: { page: number } & Partial<OrderListQueryParams>) =>
    ["order", "list", params] as const,
  details: () => ["order", "detail"] as const,
  detail: (orderId: string) => ["order", "detail", orderId] as const,
  /** 스토어 캘린더용: 스토어 + 선택한 픽업일(YYYY-MM-DD)별 주문 */
  calendarByStore: (storeId: string, pickupDayKey: string | null) =>
    ["order", "calendar-by-store", storeId, pickupDayKey] as const,
  /** 스토어 캘린더용: 스토어 + 픽업 월(YYYY-MM-DD ~ YYYY-MM-DD)별 주문 */
  calendarMonthByStore: (storeId: string, pickupStartKey: string, pickupEndKey: string) =>
    ["order", "calendar-month-by-store", storeId, pickupStartKey, pickupEndKey] as const,
} as const;
