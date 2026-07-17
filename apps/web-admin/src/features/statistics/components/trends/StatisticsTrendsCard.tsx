import React, { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/apps/web-admin/common/components/cards/Card";
import { ContentLoading } from "@/apps/web-admin/common/components/loading/ContentLoading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/apps/web-admin/common/components/selects/Select";
import {
  LIST_CARD,
  LIST_CARD_TITLE,
} from "@/apps/web-admin/common/constants/list-typography.constant";
import { StatisticsNewStoresTrendChart } from "@/apps/web-admin/features/statistics/components/trends/StatisticsNewStoresTrendChart";
import { StatisticsOrdersGmvTrendChart } from "@/apps/web-admin/features/statistics/components/trends/StatisticsOrdersGmvTrendChart";
import { StatisticsSignupTrendChart } from "@/apps/web-admin/features/statistics/components/trends/StatisticsSignupTrendChart";
import { StatisticsStoreEntryRequestsTrendChart } from "@/apps/web-admin/features/statistics/components/trends/StatisticsStoreEntryRequestsTrendChart";
import {
  STATISTICS_TREND_PERIOD_DEFAULT,
  STATISTICS_TREND_PERIOD_OPTIONS,
  type StatisticsTrendPeriodValue,
} from "@/apps/web-admin/features/statistics/constants/statistics.constant";
import { useStatisticsDailyTrends } from "@/apps/web-admin/features/statistics/hooks/queries/useStatisticsQuery";
import type { StatisticsTrendChartKind } from "@/apps/web-admin/features/statistics/types/statistics-chart.type";
import {
  formatYmdShort,
  getRecentDaysRange,
} from "@/apps/web-admin/features/statistics/utils/statistics-date.util";
import { resolveDailyTrendMetrics } from "@/apps/web-admin/features/statistics/utils/statistics-trend.util";

export type { StatisticsTrendChartKind };

const CHART_LABELS: Record<StatisticsTrendChartKind, string> = {
  signups: "신규 가입",
  ordersGmv: "주문 · GMV",
  newStores: "신규 스토어",
  entryRequests: "입점 요청",
};

interface StatisticsTrendsCardProps {
  title?: string;
  description?: string;
  /** 표시할 차트 (기본: 전부) */
  charts?: readonly StatisticsTrendChartKind[];
}

/** 일별 추이 카드 (기간 선택 공용, 페이지별로 차트 조합 지정) */
export const StatisticsTrendsCard: React.FC<StatisticsTrendsCardProps> = ({
  title = "일별 추이",
  description = "Asia/Seoul 달력일 기준",
  charts = ["signups", "ordersGmv"],
}) => {
  const [period, setPeriod] = useState<StatisticsTrendPeriodValue>(STATISTICS_TREND_PERIOD_DEFAULT);
  const metrics = useMemo(() => resolveDailyTrendMetrics(charts), [charts]);

  const { startDate, endDate } = useMemo(() => getRecentDaysRange(Number(period)), [period]);
  const { data, isLoading } = useStatisticsDailyTrends(startDate, endDate, metrics);

  const chartData = useMemo(
    () =>
      (data?.days ?? []).map((day) => ({
        ...day,
        dateLabel: formatYmdShort(day.date),
      })),
    [data],
  );

  return (
    <Card className={LIST_CARD}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="space-y-1.5">
          <CardTitle className={LIST_CARD_TITLE}>{title}</CardTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Select
          value={period}
          onValueChange={(value) => setPeriod(value as StatisticsTrendPeriodValue)}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATISTICS_TREND_PERIOD_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ContentLoading variant="section" message="추이를 불러오는 중…" className="py-12" />
        ) : (
          <div className={charts.length > 1 ? "grid gap-6 lg:grid-cols-2" : ""}>
            {charts.map((kind) => (
              <div key={kind} className="space-y-2">
                <p className="text-sm font-medium text-foreground">{CHART_LABELS[kind]}</p>
                {kind === "signups" && <StatisticsSignupTrendChart data={chartData} />}
                {kind === "ordersGmv" && <StatisticsOrdersGmvTrendChart data={chartData} />}
                {kind === "newStores" && <StatisticsNewStoresTrendChart data={chartData} />}
                {kind === "entryRequests" && (
                  <StatisticsStoreEntryRequestsTrendChart data={chartData} />
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
