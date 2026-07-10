/** TanStack Query staleTime (ms) — 도메인별 캐시 유지 시간 */
export const QUERY_STALE_TIME = {
  /** 기본값 — 목록·일반 조회 */
  DEFAULT: 30 * 1000,
  /** 자주 바뀌지 않는 정적 데이터 (배너, 지역, 약관 등) */
  STATIC: 5 * 60 * 1000,
  /** 상품·스토어 상세 */
  DETAIL: 60 * 1000,
  /** 주문·알림 등 실시간성이 중요한 데이터 */
  REALTIME: 0,
} as const;
