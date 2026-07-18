/**
 * AdminStatistics(전사 통계) 관련 쿼리 키 상수
 */
export const statisticsQueryKeys = {
  all: ["statistics"] as const,
  users: () => [...statisticsQueryKeys.all, "users"] as const,
  orders: () => [...statisticsQueryKeys.all, "orders"] as const,
  stores: () => [...statisticsQueryKeys.all, "stores"] as const,
  storeEntryRequests: () => [...statisticsQueryKeys.all, "store-entry-requests"] as const,
  dailyTrends: (startDate: string, endDate: string, metrics: string) =>
    [...statisticsQueryKeys.all, "daily-trends", startDate, endDate, metrics] as const,
} as const;
