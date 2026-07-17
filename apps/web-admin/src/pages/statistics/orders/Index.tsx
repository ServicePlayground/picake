import React from "react";
import { ShoppingBag, Wallet } from "lucide-react";
import { ContentLoading } from "@/apps/web-admin/common/components/loading/ContentLoading";
import { EmptyState } from "@/apps/web-admin/common/components/fallbacks/EmptyState";
import {
  LIST_SCREEN_HEADING,
  LIST_SECTION_GAP,
} from "@/apps/web-admin/common/constants/list-typography.constant";
import { StatisticsStatusCountCard } from "@/apps/web-admin/features/statistics/components/shared/StatisticsStatusCountCard";
import { StatisticsSummaryCard } from "@/apps/web-admin/features/statistics/components/shared/StatisticsSummaryCard";
import { StatisticsTrendsCard } from "@/apps/web-admin/features/statistics/components/trends/StatisticsTrendsCard";
import { STATISTICS_ORDER_STATUS_LABELS } from "@/apps/web-admin/features/statistics/constants/statistics.constant";
import { useStatisticsOverview } from "@/apps/web-admin/features/statistics/hooks/queries/useStatisticsQuery";

/**
 * 통계 > 주문·매출 통계
 *
 * GMV(픽업 완료 기준)·주문 수와 일별 추이, 주문 상태별 분포를 봅니다.
 */
export const StatisticsOrdersPage: React.FC = () => {
  const { data: overview, isLoading } = useStatisticsOverview();

  return (
    <div className={LIST_SECTION_GAP}>
      <h1 className={LIST_SCREEN_HEADING}>주문·매출 통계</h1>

      {isLoading && (
        <ContentLoading variant="section" message="현황을 불러오는 중…" className="py-12" />
      )}

      {!isLoading && !overview && <EmptyState message="현황 데이터를 불러오지 못했습니다." />}

      {overview && (
        <>
          {/* 주문·매출 요약 */}
          <div className="grid gap-4 sm:grid-cols-2">
            <StatisticsSummaryCard
              icon={<Wallet className="h-4 w-4" />}
              title="GMV (픽업 완료 기준)"
              value={`${overview.orders.gmv.toLocaleString()}원`}
              footnote="픽업 완료된 주문의 총 금액 합"
            />
            <StatisticsSummaryCard
              icon={<ShoppingBag className="h-4 w-4" />}
              title="총 주문 수"
              value={`${overview.orders.total.toLocaleString()}건`}
              footnote="모든 상태의 주문 포함"
            />
          </div>

          {/* 주문·GMV 추이 */}
          <StatisticsTrendsCard
            title="주문·매출 추이"
            description="일별 주문 수(모든 상태)와 GMV (Asia/Seoul 달력일 기준)"
            charts={["ordersGmv"]}
          />

          {/* 주문 상태별 현황 */}
          <StatisticsStatusCountCard
            title="주문 상태별 현황"
            description={`전체 ${overview.orders.total.toLocaleString()}건`}
            items={overview.orders.byStatus}
            labels={STATISTICS_ORDER_STATUS_LABELS}
            emptyMessage="주문이 없습니다."
          />
        </>
      )}
    </div>
  );
};
