/** TanStack Query staleTime (ms) — 도메인별 캐시 유지 시간 */
export const QUERY_STALE_TIME = {
  /** 기본값 — 목록·일반 조회 */
  DEFAULT: 30 * 1000,
  /** 스토어 목록·상세, 대시보드 등 */
  STORE: 2 * 60 * 1000,
  /** 알림 설정 등 거의 변하지 않는 데이터 */
  STATIC: 5 * 60 * 1000,
  /** 주문·알림 등 실시간성이 중요한 데이터 */
  REALTIME: 0,
} as const;
