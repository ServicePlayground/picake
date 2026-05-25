/**
 * 스토어 홈용 주문 통계 요약. 누적(오늘 포함 최근 90일) 고정, 기간 선택 UI 없음.
 * 요일·시간대 차트는 통계 상세 화면에서만 표시합니다.
 */
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { BarChart3 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/apps/web-seller/common/components/cards/Card";
import { BaseButton as Button } from "@/apps/web-seller/common/components/buttons/BaseButton";
import { STATISTICS_ACCUMULATED_DAY_OFFSET } from "@/apps/web-seller/features/statistics/constants/statistics.constant";
import { useStatisticsOverviewQuery } from "@/apps/web-seller/features/statistics/hooks/queries/useStatisticsOverviewQuery";
import {
  addDaysISODate,
  todayISODateLocal,
} from "@/apps/web-seller/features/statistics/utils/statistics-date.util";
import { ROUTES } from "@/apps/web-seller/common/constants/paths.constant";
import { cn } from "@/apps/web-seller/common/utils/classname.util";
import { ContentLoading } from "@/apps/web-seller/common/components/loading/ContentLoading";
import { FetchStatusInline } from "@/apps/web-seller/common/components/loading/FetchStatusInline";
import {
  HOME_CARD,
  HOME_CARD_ACTION_BUTTON,
  HOME_CARD_HEADER,
  HOME_BODY_MUTED,
  HOME_CARD_TITLE,
  HOME_CAPTION,
  HOME_EMPHASIS,
  HOME_GRID_2_COL,
  HOME_ITEM_BOX,
  HOME_LABEL,
  HOME_NUMBER,
  HOME_NUMBER_KPI,
} from "@/apps/web-seller/features/home/constants/store-home-typography.constant";

export interface StoreHomeStatisticsSectionProps {
  storeId: string;
}

function formatRangeLabel(startIso: string, endIso: string): string {
  const fmt = (iso: string) => {
    const [y, m, d] = iso.split("-").map((v) => parseInt(v, 10));
    return `${y}년 ${m}월 ${d}일`;
  };
  return `${fmt(startIso)} ~ ${fmt(endIso)} · 누적(최근 90일)`;
}

export const StoreHomeStatisticsSection: React.FC<StoreHomeStatisticsSectionProps> = ({
  storeId,
}) => {
  const { startDate, endDate, rangeLabel } = useMemo(() => {
    const end = todayISODateLocal();
    const start = addDaysISODate(end, STATISTICS_ACCUMULATED_DAY_OFFSET);
    return {
      startDate: start,
      endDate: end,
      rangeLabel: formatRangeLabel(start, end),
    };
  }, []);

  const { data, isLoading, isFetching, refetch } = useStatisticsOverviewQuery({
    storeId,
    startDate,
    endDate,
  });

  const totalSales = data?.totalSales ?? 0;
  const totalOrders = data?.totalOrders ?? 0;
  const topProductsByRevenue = data?.topProductsByRevenue ?? [];
  const topProductsByOrders = data?.topProductsByOrders ?? [];

  const emptyHint = "해당 기간에 집계된 데이터가 없습니다.";

  return (
    <section className="w-full">
      <Card className={cn("w-full", HOME_CARD)}>
        <CardHeader className={HOME_CARD_HEADER}>
          <div className="min-w-0 space-y-1">
            <CardTitle className={cn("flex items-center gap-2", HOME_CARD_TITLE)}>
              <BarChart3 className="h-4 w-4 shrink-0 text-primary" />
              주문 통계
            </CardTitle>
            <p className={HOME_BODY_MUTED}>
              <span className={HOME_EMPHASIS}>{rangeLabel}</span>
              {isFetching && !isLoading ? (
                <span className="ml-2 inline-flex align-middle">
                  <FetchStatusInline message="업데이트 중…" className={HOME_CAPTION} />
                </span>
              ) : null}
            </p>
          </div>
          <Button variant="outline" size="sm" className={HOME_CARD_ACTION_BUTTON} asChild>
            <Link to={ROUTES.STORE_DETAIL_STATISTICS_ORDERS(storeId)}>통계 보기</Link>
          </Button>
        </CardHeader>

        <CardContent className="space-y-6 pt-0">
          {isLoading ? (
            <div className="flex w-full items-center justify-center rounded-lg border border-border bg-muted/20 py-6">
              <ContentLoading variant="section" message="통계를 불러오는 중…" className="py-8" />
            </div>
          ) : data ? (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card className="border-border bg-card shadow-none">
                  <CardHeader className="pb-2">
                    <p className={HOME_LABEL}>매출</p>
                  </CardHeader>
                  <CardContent>
                    <p className={HOME_NUMBER_KPI}>₩{totalSales.toLocaleString("ko-KR")}</p>
                  </CardContent>
                </Card>
                <Card className="border-border bg-card shadow-none">
                  <CardHeader className="pb-2">
                    <p className={HOME_LABEL}>주문 건수</p>
                  </CardHeader>
                  <CardContent>
                    <p className={HOME_NUMBER_KPI}>{totalOrders.toLocaleString("ko-KR")}건</p>
                  </CardContent>
                </Card>
              </div>

              <div className={HOME_GRID_2_COL}>
                <Card className={cn(HOME_CARD, "shadow-none")}>
                  <CardHeader className="pb-2">
                    <CardTitle className={HOME_CARD_TITLE}>매출 순</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {topProductsByRevenue.length === 0 ? (
                      <p className={HOME_BODY_MUTED}>{emptyHint}</p>
                    ) : (
                      topProductsByRevenue.map((p, i) => (
                        <div
                          key={p.productId}
                          className={cn(HOME_ITEM_BOX, "flex items-center justify-between")}
                        >
                          <p className={cn("truncate", HOME_EMPHASIS)}>
                            {i + 1}. {p.productName}
                          </p>
                          <p className={cn(HOME_NUMBER, "font-semibold")}>
                            ₩{p.revenue.toLocaleString("ko-KR")}
                          </p>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
                <Card className={cn(HOME_CARD, "shadow-none")}>
                  <CardHeader className="pb-2">
                    <CardTitle className={HOME_CARD_TITLE}>주문 건수 순</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {topProductsByOrders.length === 0 ? (
                      <p className={HOME_BODY_MUTED}>{emptyHint}</p>
                    ) : (
                      topProductsByOrders.map((p, i) => (
                        <div
                          key={p.productId}
                          className={cn(HOME_ITEM_BOX, "flex items-center justify-between")}
                        >
                          <p className={cn("truncate", HOME_EMPHASIS)}>
                            {i + 1}. {p.productName}
                          </p>
                          <p className={cn(HOME_NUMBER, "font-semibold")}>
                            {p.orderCount.toLocaleString("ko-KR")}건
                          </p>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
};
