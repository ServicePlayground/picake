/**
 * 통계 표시용 상수 (백엔드 enum → 한글 라벨, 추이 기간 옵션)
 */

/** `OrderStatus` → 한글 라벨 */
export const STATISTICS_ORDER_STATUS_LABELS: Record<string, string> = {
  RESERVATION_REQUESTED: "예약신청",
  PAYMENT_PENDING: "입금대기",
  PAYMENT_COMPLETED: "입금완료",
  CONFIRMED: "예약확정",
  PICKUP_PENDING: "픽업대기",
  PICKUP_COMPLETED: "픽업완료",
  CANCEL_COMPLETED: "취소완료",
  CANCEL_REFUND_PENDING: "취소환불대기",
  CANCEL_REFUND_COMPLETED: "취소환불완료",
  NO_SHOW: "노쇼",
};

/** `StoreEntryRequestStatus` → 한글 라벨 */
export const STATISTICS_STORE_ENTRY_REQUEST_STATUS_LABELS: Record<string, string> = {
  REQUESTED: "요청됨",
  REVIEWING: "검토중",
  APPROVED: "승인됨",
  REJECTED: "반려됨",
  COMPLETED: "입점 완료",
};

/** 일별 추이 조회 기간 옵션 (오늘 포함 최근 N일) */
export const STATISTICS_TREND_PERIOD_OPTIONS = [
  { value: "7", label: "최근 7일" },
  { value: "14", label: "최근 14일" },
  { value: "30", label: "최근 30일" },
] as const;

export type StatisticsTrendPeriodValue = (typeof STATISTICS_TREND_PERIOD_OPTIONS)[number]["value"];

export const STATISTICS_TREND_PERIOD_DEFAULT: StatisticsTrendPeriodValue = "14";
