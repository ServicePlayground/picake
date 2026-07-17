import React from "react";
import { Store as StoreIcon, Users } from "lucide-react";
import { ContentLoading } from "@/apps/web-admin/common/components/loading/ContentLoading";
import { EmptyState } from "@/apps/web-admin/common/components/fallbacks/EmptyState";
import {
  LIST_SCREEN_HEADING,
  LIST_SECTION_GAP,
} from "@/apps/web-admin/common/constants/list-typography.constant";
import { StatisticsSummaryCard } from "@/apps/web-admin/features/statistics/components/shared/StatisticsSummaryCard";
import { StatisticsTrendsCard } from "@/apps/web-admin/features/statistics/components/trends/StatisticsTrendsCard";
import { useStatisticsUsers } from "@/apps/web-admin/features/statistics/hooks/queries/useStatisticsQuery";
import { buildSignupSummaryRows } from "@/apps/web-admin/features/statistics/utils/statistics-summary.ui.util";

/**
 * 통계 > 회원 통계
 *
 * 구매자·판매자 가입 현황과 신규 가입 추이를 봅니다.
 */
export const StatisticsUsersPage: React.FC = () => {
  const { data: statistics, isLoading } = useStatisticsUsers();

  return (
    <div className={LIST_SECTION_GAP}>
      <h1 className={LIST_SCREEN_HEADING}>회원 통계</h1>

      {isLoading && (
        <ContentLoading variant="section" message="현황을 불러오는 중…" className="py-12" />
      )}

      {!isLoading && !statistics && <EmptyState message="현황 데이터를 불러오지 못했습니다." />}

      {statistics && (
        <>
          {/* 가입 현황 요약 */}
          <div className="grid gap-4 sm:grid-cols-2">
            <StatisticsSummaryCard
              icon={<Users className="h-4 w-4" />}
              title="구매자 가입"
              value={statistics.consumers.total.toLocaleString()}
              rows={buildSignupSummaryRows(statistics.consumers)}
            />
            <StatisticsSummaryCard
              icon={<StoreIcon className="h-4 w-4" />}
              title="판매자 가입"
              value={statistics.sellers.total.toLocaleString()}
              rows={buildSignupSummaryRows(statistics.sellers)}
            />
          </div>

          {/* 신규 가입 추이 */}
          <StatisticsTrendsCard
            title="신규 가입 추이"
            description="일별 신규 가입 수 (Asia/Seoul 달력일 기준)"
            charts={["signups"]}
          />
        </>
      )}
    </div>
  );
};
