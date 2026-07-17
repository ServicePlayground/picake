/**
 * AdminStatistics(전사 통계) 관련 쿼리 키 상수
 */
export const statisticsQueryKeys = {
  all: ["statistics"] as const,
  overview: () => [...statisticsQueryKeys.all, "overview"] as const,
  dailyTrends: (startDate: string, endDate: string) =>
    [...statisticsQueryKeys.all, "daily-trends", startDate, endDate] as const,
} as const;
