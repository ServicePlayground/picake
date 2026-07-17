import { useQuery } from "@tanstack/react-query";
import { useQueryErrorAlert } from "@/apps/web-admin/common/hooks/useQueryErrorAlert";
import { statisticsApi } from "@/apps/web-admin/features/statistics/apis/statistics.api";
import { statisticsQueryKeys } from "@/apps/web-admin/features/statistics/constants/statisticsQueryKeys.constant";
import type {
  AdminStatisticsDailyTrendsResponseDto,
  AdminStatisticsOverviewResponseDto,
} from "@/apps/web-admin/features/statistics/types/statistics.dto";

// 전사 현황 요약 조회
export function useStatisticsOverview() {
  const query = useQuery<AdminStatisticsOverviewResponseDto>({
    queryKey: statisticsQueryKeys.overview(),
    queryFn: () => statisticsApi.getOverview(),
  });

  useQueryErrorAlert(query);

  return query;
}

// 일별 추이 조회
export function useStatisticsDailyTrends(startDate: string, endDate: string) {
  const query = useQuery<AdminStatisticsDailyTrendsResponseDto>({
    queryKey: statisticsQueryKeys.dailyTrends(startDate, endDate),
    queryFn: () => statisticsApi.getDailyTrends({ startDate, endDate }),
  });

  useQueryErrorAlert(query);

  return query;
}
