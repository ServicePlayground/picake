import { BadRequestException } from "@nestjs/common";
import {
  ADMIN_STATISTICS_DAILY_TREND_METRICS,
  ADMIN_STATISTICS_DAILY_TREND_METRICS_ALL,
  ADMIN_STATISTICS_ERROR_MESSAGES,
  type AdminStatisticsDailyTrendMetric,
} from "@apps/backend/modules/statistics/admin/constants/admin-statistics.constants";

/** daily-trends 쿼리의 metrics 문자열을 검증·정규화합니다. */
export function parseAdminStatisticsDailyTrendMetrics(
  metrics?: string,
): AdminStatisticsDailyTrendMetric[] {
  if (!metrics?.trim()) {
    return ADMIN_STATISTICS_DAILY_TREND_METRICS_ALL;
  }

  const parsed = metrics
    .split(",")
    .map((metric) => metric.trim())
    .filter(Boolean);

  const invalid = parsed.filter(
    (metric) =>
      !ADMIN_STATISTICS_DAILY_TREND_METRICS.includes(metric as AdminStatisticsDailyTrendMetric),
  );
  if (invalid.length > 0) {
    throw new BadRequestException(ADMIN_STATISTICS_ERROR_MESSAGES.INVALID_DAILY_TREND_METRICS);
  }

  return [...new Set(parsed)] as AdminStatisticsDailyTrendMetric[];
}
