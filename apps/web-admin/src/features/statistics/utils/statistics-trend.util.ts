import type { StatisticsTrendChartKind } from "@/apps/web-admin/features/statistics/types/statistics-chart.type";

const CHART_METRICS: Record<StatisticsTrendChartKind, string> = {
  signups: "signups",
  ordersGmv: "orders",
  newStores: "stores",
  entryRequests: "entryRequests",
};

/** 차트 종류에 맞는 daily-trends metrics 쿼리 문자열을 만듭니다. */
export function resolveDailyTrendMetrics(charts: readonly StatisticsTrendChartKind[]): string {
  return [...new Set(charts.map((chart) => CHART_METRICS[chart]))].join(",");
}
