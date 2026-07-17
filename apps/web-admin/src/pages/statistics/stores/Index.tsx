import React from "react";
import { Inbox, ShoppingBag } from "lucide-react";
import { ContentLoading } from "@/apps/web-admin/common/components/loading/ContentLoading";
import { EmptyState } from "@/apps/web-admin/common/components/fallbacks/EmptyState";
import {
  LIST_SCREEN_HEADING,
  LIST_SECTION_GAP,
} from "@/apps/web-admin/common/constants/list-typography.constant";
import { StatisticsStatusCountCard } from "@/apps/web-admin/features/statistics/components/shared/StatisticsStatusCountCard";
import { StatisticsSummaryCard } from "@/apps/web-admin/features/statistics/components/shared/StatisticsSummaryCard";
import { STATISTICS_STORE_ENTRY_REQUEST_STATUS_LABELS } from "@/apps/web-admin/features/statistics/constants/statistics.constant";
import { useStatisticsOverview } from "@/apps/web-admin/features/statistics/hooks/queries/useStatisticsQuery";

/**
 * 통계 > 스토어·입점 통계
 *
 * 스토어 수와 구매자 입점 요청(미입점 스토어 요청) 현황을 봅니다.
 */
export const StatisticsStoresPage: React.FC = () => {
  const { data: overview, isLoading } = useStatisticsOverview();

  return (
    <div className={LIST_SECTION_GAP}>
      <h1 className={LIST_SCREEN_HEADING}>스토어·입점 통계</h1>

      {isLoading && (
        <ContentLoading variant="section" message="현황을 불러오는 중…" className="py-12" />
      )}

      {!isLoading && !overview && <EmptyState message="현황 데이터를 불러오지 못했습니다." />}

      {overview && (
        <>
          {/* 스토어·입점 요약 */}
          <div className="grid gap-4 sm:grid-cols-2">
            <StatisticsSummaryCard
              icon={<ShoppingBag className="h-4 w-4" />}
              title="스토어"
              value={overview.stores.total.toLocaleString()}
              footnote="등록된 전체 스토어 수"
            />
            <StatisticsSummaryCard
              icon={<Inbox className="h-4 w-4" />}
              title="입점 요청"
              value={`${overview.storeEntryRequests.total.toLocaleString()}건`}
              footnote="구매자가 지도에서 요청한 미입점 스토어"
            />
          </div>

          {/* 입점 요청 상태별 현황 */}
          <StatisticsStatusCountCard
            title="입점 요청 현황"
            description={`전체 ${overview.storeEntryRequests.total.toLocaleString()}건`}
            items={overview.storeEntryRequests.byStatus}
            labels={STATISTICS_STORE_ENTRY_REQUEST_STATUS_LABELS}
            emptyMessage="입점 요청이 없습니다."
          />
        </>
      )}
    </div>
  );
};
