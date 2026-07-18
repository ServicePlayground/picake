import React from "react";
import { BadgeCheck, ShoppingBag } from "lucide-react";
import { ContentLoading } from "@/apps/web-admin/common/components/loading/ContentLoading";
import { EmptyState } from "@/apps/web-admin/common/components/fallbacks/EmptyState";
import {
  LIST_SCREEN_HEADING,
  LIST_SECTION_GAP,
} from "@/apps/web-admin/common/constants/list-typography.constant";
import { StatisticsSummaryCard } from "@/apps/web-admin/features/statistics/components/shared/StatisticsSummaryCard";
import { StatisticsTrendsCard } from "@/apps/web-admin/features/statistics/components/trends/StatisticsTrendsCard";
import { useStatisticsStores } from "@/apps/web-admin/features/statistics/hooks/queries/useStatisticsQuery";

/**
 * 통계 > 스토어 통계
 *
 * 스토어 등록·사업자 검증 현황과 신규 등록 추이를 봅니다.
 */
export const StatisticsStoresPage: React.FC = () => {
  const { data: statistics, isLoading } = useStatisticsStores();

  return (
    <div className={LIST_SECTION_GAP}>
      <h1 className={LIST_SCREEN_HEADING}>스토어 통계</h1>

      {isLoading && (
        <ContentLoading variant="section" message="현황을 불러오는 중…" className="py-12" />
      )}

      {!isLoading && !statistics && <EmptyState message="현황 데이터를 불러오지 못했습니다." />}

      {statistics && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <StatisticsSummaryCard
              icon={<ShoppingBag className="h-4 w-4" />}
              title="등록 스토어"
              value={`${statistics.stores.total.toLocaleString()}개`}
              rows={[
                { label: "오늘 신규", value: `${statistics.stores.today.toLocaleString()}개` },
                {
                  label: "최근 7일",
                  value: `${statistics.stores.last7Days.toLocaleString()}개`,
                },
                {
                  label: "최근 30일",
                  value: `${statistics.stores.last30Days.toLocaleString()}개`,
                },
              ]}
            />
            <StatisticsSummaryCard
              icon={<BadgeCheck className="h-4 w-4" />}
              title="사업자 검증 현황"
              value={`${statistics.businessVerifiedStores.total.toLocaleString()}개`}
              rows={[
                {
                  label: "오늘 신규",
                  value: `${statistics.businessVerifiedStores.today.toLocaleString()}개`,
                },
                {
                  label: "최근 7일",
                  value: `${statistics.businessVerifiedStores.last7Days.toLocaleString()}개`,
                },
                {
                  label: "최근 30일",
                  value: `${statistics.businessVerifiedStores.last30Days.toLocaleString()}개`,
                },
              ]}
            />
          </div>

          <StatisticsTrendsCard
            title="신규 스토어 추이"
            description="일별 신규 스토어·사업자 검증 완료 스토어 수 (Asia/Seoul 달력일 기준)"
            charts={["newStores"]}
          />
        </>
      )}
    </div>
  );
};
