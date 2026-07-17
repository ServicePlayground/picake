import React from "react";
import { ContentLoading } from "@/apps/web-admin/common/components/loading/ContentLoading";
import { EmptyState } from "@/apps/web-admin/common/components/fallbacks/EmptyState";
import {
  LIST_SCREEN_HEADING,
  LIST_SECTION_GAP,
} from "@/apps/web-admin/common/constants/list-typography.constant";
import { StatisticsSummaryCards } from "@/apps/web-admin/features/statistics/components/overview/StatisticsSummaryCards";
import { StatisticsTrendsCard } from "@/apps/web-admin/features/statistics/components/trends/StatisticsTrendsCard";
import { useStatisticsOverview } from "@/apps/web-admin/features/statistics/hooks/queries/useStatisticsQuery";

/**
 * 통계 > 전체 현황
 *
 * 전사 핵심 지표 요약과 일별 추이를 한눈에 봅니다.
 * 상세 지표는 회원·주문/매출·스토어/입점 하위 페이지에서 확인합니다.
 */
export const StatisticsOverviewPage: React.FC = () => {
  const { data: overview, isLoading } = useStatisticsOverview();

  return (
    <div className={LIST_SECTION_GAP}>
      <h1 className={LIST_SCREEN_HEADING}>전체 현황</h1>

      {isLoading && (
        <ContentLoading variant="section" message="현황을 불러오는 중…" className="py-12" />
      )}

      {!isLoading && !overview && <EmptyState message="현황 데이터를 불러오지 못했습니다." />}

      {overview && (
        <>
          <StatisticsSummaryCards overview={overview} />
          <StatisticsTrendsCard />
        </>
      )}
    </div>
  );
};
