import { useQuery } from "@tanstack/react-query";
import { useQueryErrorAlert } from "@/apps/web-admin/common/hooks/useQueryErrorAlert";
import { statisticsApi } from "@/apps/web-admin/features/statistics/apis/statistics.api";
import { statisticsQueryKeys } from "@/apps/web-admin/features/statistics/constants/statisticsQueryKeys.constant";
import type {
  AdminStatisticsDailyTrendsResponseDto,
  AdminStatisticsOrdersResponseDto,
  AdminStatisticsStoreEntryRequestsResponseDto,
  AdminStatisticsStoresResponseDto,
  AdminStatisticsUsersResponseDto,
} from "@/apps/web-admin/features/statistics/types/statistics.dto";

// 회원 통계 조회
export function useStatisticsUsers() {
  const query = useQuery<AdminStatisticsUsersResponseDto>({
    queryKey: statisticsQueryKeys.users(),
    queryFn: () => statisticsApi.getUsers(),
  });

  useQueryErrorAlert(query);

  return query;
}

// 주문·매출 통계 조회
export function useStatisticsOrders() {
  const query = useQuery<AdminStatisticsOrdersResponseDto>({
    queryKey: statisticsQueryKeys.orders(),
    queryFn: () => statisticsApi.getOrders(),
  });

  useQueryErrorAlert(query);

  return query;
}

// 스토어 통계 조회
export function useStatisticsStores() {
  const query = useQuery<AdminStatisticsStoresResponseDto>({
    queryKey: statisticsQueryKeys.stores(),
    queryFn: () => statisticsApi.getStores(),
  });

  useQueryErrorAlert(query);

  return query;
}

// 입점 통계 조회
export function useStatisticsStoreEntryRequests() {
  const query = useQuery<AdminStatisticsStoreEntryRequestsResponseDto>({
    queryKey: statisticsQueryKeys.storeEntryRequests(),
    queryFn: () => statisticsApi.getStoreEntryRequests(),
  });

  useQueryErrorAlert(query);

  return query;
}

// 일별 추이 조회
export function useStatisticsDailyTrends(startDate: string, endDate: string, metrics: string) {
  const query = useQuery<AdminStatisticsDailyTrendsResponseDto>({
    queryKey: statisticsQueryKeys.dailyTrends(startDate, endDate, metrics),
    queryFn: () => statisticsApi.getDailyTrends({ startDate, endDate, metrics }),
  });

  useQueryErrorAlert(query);

  return query;
}
