import type { AdminStatisticsDailyTrendDto } from "@/apps/web-admin/features/statistics/types/statistics.dto";

/** 추이 차트 한 점 (일별 추이 + X축 라벨) */
export interface StatisticsTrendChartDatum extends AdminStatisticsDailyTrendDto {
  /** X축 라벨 (M/D) */
  dateLabel: string;
}

/** 표시할 추이 차트 종류 */
export type StatisticsTrendChartKind = "signups" | "ordersGmv" | "newStores" | "entryRequests";
