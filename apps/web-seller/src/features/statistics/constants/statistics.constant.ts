/** 기간 선택: 시작·종료 포함 최대 일수 */
export const STATISTICS_MAX_RANGE_DAYS = 120;

/** '누적' 프리셋: 오늘 포함 며칠 구간인지에 맞춘 `addDays` 오프셋 (오늘 + 과거 89일 = 90일) */
export const STATISTICS_ACCUMULATED_DAY_OFFSET = -89;

/** 첫 진입 기본 기간: 오늘 기준 며칠 전부터 (포함 일수 = 이 값 + 1) */
export const STATISTICS_DEFAULT_DAY_OFFSET = -6;

/**
 * 주문 통계 화면 카드 표면 — 영역마다 색을 달리하지 않고 동일 톤의 그라데이션만 사용합니다.
 * (차트 막대 색은 `HorizontalMetricBars` 등에서 구분)
 */
export const STATISTICS_SURFACE_CARD =
  "border-border/90 bg-gradient-to-br from-violet-50/50 via-background to-muted/25 shadow-sm dark:border-border dark:from-violet-500/[0.11] dark:via-background dark:to-background";

/** 순위·리스트 한 줄 */
export const STATISTICS_INNER_ROW =
  "rounded-xl border border-border/70 bg-background/80 px-3 py-2.5 backdrop-blur-[1px] dark:bg-background/35";

/** 시간대 차트 래퍼 */
export const STATISTICS_CHART_WRAP =
  "overflow-x-auto rounded-lg border border-border/70 bg-background/80 p-2 dark:bg-background/30";
