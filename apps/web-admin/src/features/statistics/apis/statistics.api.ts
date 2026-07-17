import { adminClient } from "@/apps/web-admin/common/config/axios.config";
import type {
  AdminStatisticsDailyTrendsRequestDto,
  AdminStatisticsDailyTrendsResponseDto,
  AdminStatisticsOrdersResponseDto,
  AdminStatisticsStoreEntryRequestsResponseDto,
  AdminStatisticsStoresResponseDto,
  AdminStatisticsUsersResponseDto,
} from "@/apps/web-admin/features/statistics/types/statistics.dto";

export const statisticsApi = {
  // 회원 통계 조회
  getUsers: async (): Promise<AdminStatisticsUsersResponseDto> => {
    const response = await adminClient.get("/statistics/users");
    return response.data.data;
  },

  // 주문·매출 통계 조회
  getOrders: async (): Promise<AdminStatisticsOrdersResponseDto> => {
    const response = await adminClient.get("/statistics/orders");
    return response.data.data;
  },

  // 스토어 통계 조회
  getStores: async (): Promise<AdminStatisticsStoresResponseDto> => {
    const response = await adminClient.get("/statistics/stores");
    return response.data.data;
  },

  // 입점 통계 조회
  getStoreEntryRequests: async (): Promise<AdminStatisticsStoreEntryRequestsResponseDto> => {
    const response = await adminClient.get("/statistics/store-entry-requests");
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
