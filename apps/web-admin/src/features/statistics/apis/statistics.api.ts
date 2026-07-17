import { adminClient } from "@/apps/web-admin/common/config/axios.config";
import type {
  AdminStatisticsDailyTrendsRequestDto,
  AdminStatisticsDailyTrendsResponseDto,
  AdminStatisticsOverviewResponseDto,
} from "@/apps/web-admin/features/statistics/types/statistics.dto";

export const statisticsApi = {
  // 전사 현황 요약 조회
  getOverview: async (): Promise<AdminStatisticsOverviewResponseDto> => {
    const response = await adminClient.get("/statistics/overview");
    return response.data.data;
  },

  // 일별 추이 조회
  getDailyTrends: async (
    params: AdminStatisticsDailyTrendsRequestDto,
  ): Promise<AdminStatisticsDailyTrendsResponseDto> => {
    const response = await adminClient.get("/statistics/daily-trends", { params });
    return response.data.data;
  },
};
