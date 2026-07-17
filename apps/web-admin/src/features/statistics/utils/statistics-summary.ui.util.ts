import type { StatisticsSummaryRow } from "@/apps/web-admin/features/statistics/components/shared/StatisticsSummaryCard";
import type { AdminStatisticsSignupStatDto } from "@/apps/web-admin/features/statistics/types/statistics.dto";

/** 가입 현황(구매자·판매자 공통) 요약 카드 보조 행 구성 */
export function buildSignupSummaryRows(stat: AdminStatisticsSignupStatDto): StatisticsSummaryRow[] {
  return [
    { label: "오늘", value: `+${stat.today.toLocaleString()}` },
    { label: "최근 7일", value: `+${stat.last7Days.toLocaleString()}` },
    { label: "최근 30일", value: `+${stat.last30Days.toLocaleString()}` },
    { label: "탈퇴", value: stat.withdrawn.toLocaleString() },
  ];
}
