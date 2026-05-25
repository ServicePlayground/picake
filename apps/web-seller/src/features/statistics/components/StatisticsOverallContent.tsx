/**
 * 스토어 주문 통계 개요 UI. 기간 선택 → GET overview API → 카드·랭킹·요일/시간 차트까지 한 화면에 배치합니다.
 */
import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/apps/web-seller/common/components/cards/Card";
import { HourlyOrderChart } from "@/apps/web-seller/features/statistics/components/charts/HourlyOrderChart";
import { HorizontalMetricBars } from "@/apps/web-seller/features/statistics/components/charts/HorizontalMetricBars";
import { StatisticsDateRangeField } from "@/apps/web-seller/features/statistics/components/StatisticsDateRangeField";
import { StatisticsRangePresetButtons } from "@/apps/web-seller/features/statistics/components/StatisticsRangePresetButtons";
import { useStatisticsOverviewRangeState } from "@/apps/web-seller/features/statistics/hooks/useStatisticsOverviewRangeState";
import { useStatisticsOverviewQuery } from "@/apps/web-seller/features/statistics/hooks/queries/useStatisticsOverviewQuery";
import {
  hourlyOrdersToValues24,
  weekdayRowsToMetricItems,
} from "@/apps/web-seller/features/statistics/utils/statistics-chart.util";
import {
  STATISTICS_CHART_WRAP,
  STATISTICS_INNER_ROW,
  STATISTICS_SURFACE_CARD,
} from "@/apps/web-seller/features/statistics/constants/statistics.constant";
import { cn } from "@/apps/web-seller/common/utils/classname.util";
import { ContentLoading } from "@/apps/web-seller/common/components/loading/ContentLoading";
import { FetchStatusInline } from "@/apps/web-seller/common/components/loading/FetchStatusInline";

export interface StatisticsOverallContentProps {
  storeId: string;
}

export const StatisticsOverallContent: React.FC<StatisticsOverallContentProps> = ({ storeId }) => {
  const {
    startDate,
    endDate,
    setRange,
    selectedPreset,
    applyAccumulated,
    applyThisMonth,
    applyThisWeek,
    applyToday,
    markCustom,
  } = useStatisticsOverviewRangeState();

  const { data, isLoading, isFetching } = useStatisticsOverviewQuery({
    storeId,
    startDate,
    endDate,
  });

  const totalSales = data?.totalSales ?? 0;
  const totalOrders = data?.totalOrders ?? 0;

  const topProductsByRevenue = data?.topProductsByRevenue ?? [];
  const topProductsByOrders = data?.topProductsByOrders ?? [];

  const weekdaySales = useMemo(
    () => weekdayRowsToMetricItems(data?.weekdaySales, true),
    [data?.weekdaySales],
  );
  const weekdayOrders = useMemo(
    () => weekdayRowsToMetricItems(data?.weekdayOrders, true),
    [data?.weekdayOrders],
  );

  const hourlyValues = useMemo(
    () => hourlyOrdersToValues24(data?.hourlyOrders),
    [data?.hourlyOrders],
  );

  const weekdayPickupSales = useMemo(
    () => weekdayRowsToMetricItems(data?.weekdayPickupSales, true),
    [data?.weekdayPickupSales],
  );
  const weekdayPickupOrders = useMemo(
    () => weekdayRowsToMetricItems(data?.weekdayPickupOrders, true),
    [data?.weekdayPickupOrders],
  );
  const hourlyPickupValues = useMemo(
    () => hourlyOrdersToValues24(data?.hourlyPickupOrders),
    [data?.hourlyPickupOrders],
  );

  const emptyHint = "해당 기간에 집계된 데이터가 없습니다.";

  return (
    <div className="space-y-7">
      <Card className={STATISTICS_SURFACE_CARD}>
        <CardContent className="space-y-4 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <p className="text-sm font-semibold tracking-tight text-foreground">
              선택한 기간 기준 주문 전체 요약
            </p>
            {isFetching && !isLoading ? <FetchStatusInline message="업데이트 중…" /> : null}
          </div>
          <StatisticsDateRangeField
            startDate={startDate}
            endDate={endDate}
            onChange={(next) => {
              markCustom();
              setRange(next);
            }}
          />
          <StatisticsRangePresetButtons
            selectedPreset={selectedPreset}
            onAccumulated={applyAccumulated}
            onThisMonth={applyThisMonth}
            onThisWeek={applyThisWeek}
            onToday={applyToday}
          />
        </CardContent>
      </Card>

      {isLoading ? (
        <div
          className={cn(
            "flex items-center justify-center rounded-lg border py-8",
            STATISTICS_SURFACE_CARD,
          )}
        >
          <ContentLoading variant="section" message="통계를 불러오는 중…" className="py-10" />
        </div>
      ) : data ? (
        <>
          <p className="text-xs text-muted-foreground">
            기간은 주문 <span className="font-medium">접수일</span>(서버 Asia/Seoul 달력) 기준이며,
            집계 대상 주문 상태는 <span className="font-medium">픽업 완료</span>만 포함됩니다.
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card className={STATISTICS_SURFACE_CARD}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">매출</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold tracking-tight tabular-nums">
                  ₩{totalSales.toLocaleString("ko-KR")}
                </p>
              </CardContent>
            </Card>
            <Card className={STATISTICS_SURFACE_CARD}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">주문건수</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold tracking-tight tabular-nums">
                  {totalOrders.toLocaleString("ko-KR")}건
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className={STATISTICS_SURFACE_CARD}>
              <CardHeader>
                <CardTitle className="text-base">매출 순</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topProductsByRevenue.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{emptyHint}</p>
                ) : (
                  topProductsByRevenue.map((p, i) => (
                    <div
                      key={p.productId}
                      className={cn("flex items-center justify-between", STATISTICS_INNER_ROW)}
                    >
                      <p className="truncate text-sm font-medium">
                        {i + 1}. {p.productName}
                      </p>
                      <p className="text-sm font-semibold tabular-nums">
                        ₩{p.revenue.toLocaleString("ko-KR")}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
            <Card className={STATISTICS_SURFACE_CARD}>
              <CardHeader>
                <CardTitle className="text-base">주문건수 순</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topProductsByOrders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{emptyHint}</p>
                ) : (
                  topProductsByOrders.map((p, i) => (
                    <div
                      key={p.productId}
                      className={cn("flex items-center justify-between", STATISTICS_INNER_ROW)}
                    >
                      <p className="truncate text-sm font-medium">
                        {i + 1}. {p.productName}
                      </p>
                      <p className="text-sm font-semibold tabular-nums">
                        {p.orderCount.toLocaleString("ko-KR")}건
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className={cn("h-full overflow-hidden", STATISTICS_SURFACE_CARD)}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">요일별 주문 요약</CardTitle>
                <p className="text-xs font-normal text-muted-foreground">주문 접수 시각 기준</p>
              </CardHeader>
              <CardContent className="space-y-8">
                {weekdaySales.length === 0 && weekdayOrders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{emptyHint}</p>
                ) : (
                  <>
                    {weekdaySales.length > 0 ? (
                      <HorizontalMetricBars
                        items={weekdaySales}
                        formatValue={(n) => `₩${n.toLocaleString("ko-KR")}`}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        요일별 매출 데이터가 없습니다.
                      </p>
                    )}
                    {weekdayOrders.length > 0 ? (
                      <HorizontalMetricBars
                        items={weekdayOrders}
                        formatValue={(n) => `${n.toLocaleString("ko-KR")}건`}
                        variant="emerald"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        요일별 주문 건수 데이터가 없습니다.
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
            <Card className={cn("h-full overflow-hidden", STATISTICS_SURFACE_CARD)}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">시간대별 주문 요약</CardTitle>
                <p className="text-xs font-normal text-muted-foreground">주문 접수 시각 기준</p>
              </CardHeader>
              <CardContent>
                <div className={STATISTICS_CHART_WRAP}>
                  <div className="min-w-[320px]">
                    <HourlyOrderChart values={hourlyValues} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className={cn("h-full overflow-hidden", STATISTICS_SURFACE_CARD)}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">요일별 픽업 요약</CardTitle>
                <p className="text-xs font-normal text-muted-foreground">픽업 예정일시 기준</p>
              </CardHeader>
              <CardContent className="space-y-8">
                {weekdayPickupSales.length === 0 && weekdayPickupOrders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{emptyHint}</p>
                ) : (
                  <>
                    {weekdayPickupSales.length > 0 ? (
                      <HorizontalMetricBars
                        items={weekdayPickupSales}
                        formatValue={(n) => `₩${n.toLocaleString("ko-KR")}`}
                        variant="violet"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        요일별 매출 데이터가 없습니다.
                      </p>
                    )}
                    {weekdayPickupOrders.length > 0 ? (
                      <HorizontalMetricBars
                        items={weekdayPickupOrders}
                        formatValue={(n) => `${n.toLocaleString("ko-KR")}건`}
                        variant="emerald"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        요일별 주문 건수 데이터가 없습니다.
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
            <Card className={cn("h-full overflow-hidden", STATISTICS_SURFACE_CARD)}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">시간대별 픽업 요약</CardTitle>
                <p className="text-xs font-normal text-muted-foreground">픽업 예정일시 기준</p>
              </CardHeader>
              <CardContent>
                <div className={STATISTICS_CHART_WRAP}>
                  <div className="min-w-[320px]">
                    <HourlyOrderChart values={hourlyPickupValues} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
};
