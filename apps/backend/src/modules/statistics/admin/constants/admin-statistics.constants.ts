import { OrderStatus } from "@apps/backend/infra/database/prisma/generated/client";

/**
 * 관리자 통계 상수
 *
 * GMV(확정 매출)는 판매자 주문 통계(`order-statistics.constants.ts`)와 동일하게
 * 픽업 완료(PICKUP_COMPLETED) 주문만 집계합니다.
 */
export const ADMIN_STATISTICS_GMV_ORDER_STATUSES: OrderStatus[] = [OrderStatus.PICKUP_COMPLETED];

/** 일별 추이 조회 최대 구간(일). 과도한 구간 조회로 인한 부하 방지 */
export const ADMIN_STATISTICS_DAILY_TRENDS_MAX_DAYS = 92;

/** 가입 현황의 "최근 N일" 집계 구간 (오늘 포함) */
export const ADMIN_STATISTICS_RECENT_DAYS_SHORT = 7;
export const ADMIN_STATISTICS_RECENT_DAYS_LONG = 30;

/** 일별 추이에서 선택 가능한 지표 */
export const ADMIN_STATISTICS_DAILY_TREND_METRICS = [
  "signups",
  "orders",
  "stores",
  "entryRequests",
] as const;

export type AdminStatisticsDailyTrendMetric = (typeof ADMIN_STATISTICS_DAILY_TREND_METRICS)[number];

export const ADMIN_STATISTICS_DAILY_TREND_METRICS_ALL: AdminStatisticsDailyTrendMetric[] = [
  "signups",
  "orders",
  "stores",
  "entryRequests",
];

export const ADMIN_STATISTICS_ERROR_MESSAGES = {
  INVALID_DATE_RANGE: "startDate는 endDate보다 이전이어야 합니다.",
  DATE_RANGE_TOO_LONG: `조회 구간은 최대 ${ADMIN_STATISTICS_DAILY_TRENDS_MAX_DAYS}일까지 가능합니다.`,
  INVALID_DAILY_TREND_METRICS: `metrics는 ${ADMIN_STATISTICS_DAILY_TREND_METRICS.join(", ")} 중 하나 이상이어야 합니다.`,
} as const;
