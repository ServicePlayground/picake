import { OrderStatus } from "@apps/backend/infra/database/prisma/generated/client";

/**
 * 주문 통계에 포함할 주문 상태
 * 픽업 완료(PICKUP_COMPLETED)된 주문만 실적(매출·건수)으로 집계합니다.
 */
export const SELLER_ORDER_STATISTICS_INCLUDED_STATUSES: OrderStatus[] = [
  OrderStatus.PICKUP_COMPLETED,
];

/** 매출·건수 랭킹 상위 N */
export const SELLER_ORDER_STATISTICS_TOP_PRODUCTS_LIMIT = 5;

/** `getDay()` 인덱스 → 한글 한 글자 (0=일 … 6=토) */
export const SELLER_ORDER_STATISTICS_WEEKDAY_LABELS = [
  "일",
  "월",
  "화",
  "수",
  "목",
  "금",
  "토",
] as const;

/**
 * 응답·UI에서 월→일 순으로 나열할 때의 요일 인덱스 순서
 * (`Date#getDay`: 월=1 … 토=6, 일=0)
 */
export const SELLER_ORDER_STATISTICS_WEEKDAY_INDEX_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

export const SELLER_ORDER_STATISTICS_PRODUCT_NAME_FALLBACK = "(이름 없음)";
