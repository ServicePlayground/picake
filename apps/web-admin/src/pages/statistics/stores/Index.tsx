import React from "react";
import { Building2, MapPin, ShoppingBag } from "lucide-react";
import { ContentLoading } from "@/apps/web-admin/common/components/loading/ContentLoading";
import { EmptyState } from "@/apps/web-admin/common/components/fallbacks/EmptyState";
import {
  LIST_SCREEN_HEADING,
  LIST_SECTION_GAP,
} from "@/apps/web-admin/common/constants/list-typography.constant";
import { StatisticsStatusCountCard } from "@/apps/web-admin/features/statistics/components/shared/StatisticsStatusCountCard";
import { StatisticsSummaryCard } from "@/apps/web-admin/features/statistics/components/shared/StatisticsSummaryCard";
import { StatisticsTrendsCard } from "@/apps/web-admin/features/statistics/components/trends/StatisticsTrendsCard";
import { STATISTICS_SELLER_VERIFICATION_STATUS_LABELS } from "@/apps/web-admin/features/statistics/constants/statistics.constant";
import { useStatisticsStores } from "@/apps/web-admin/features/statistics/hooks/queries/useStatisticsQuery";

/**
 * 통계 > 스토어 통계
 *
 * 스토어 등록·운영 상태와 판매자 입점 준비를 봅니다.
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
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
              icon={<MapPin className="h-4 w-4" />}
              title="스토어 운영 준비"
              value={`${statistics.stores.withProducts.toLocaleString()}개`}
              rows={[
                {
                  label: "상품 등록",
                  value: `${statistics.stores.withProducts.toLocaleString()}개`,
                },
                {
                  label: "위치 등록",
                  value: `${statistics.stores.withLocation.toLocaleString()}개`,
                },
                {
                  label: "주문 발생",
                  value: `${statistics.stores.withOrders.toLocaleString()}개`,
                },
              ]}
            />
            <StatisticsSummaryCard
              icon={<Building2 className="h-4 w-4" />}
              title="판매자 입점"
              value={`${statistics.stores.owners.toLocaleString()}명`}
              rows={[
                {
                  label: "스토어 보유",
                  value: `${statistics.stores.owners.toLocaleString()}명`,
                },
                {
                  label: "복수 스토어 보유",
                  value: `${statistics.stores.multipleStoreOwners.toLocaleString()}명`,
                },
                {
                  label: "스토어 미등록",
                  value: `${statistics.stores.sellersWithoutStore.toLocaleString()}명`,
                },
              ]}
            />
          </div>

          <StatisticsTrendsCard
            title="신규 스토어 추이"
            description="일별 신규 스토어 등록 수 (Asia/Seoul 달력일 기준)"
            charts={["newStores"]}
          />

          <StatisticsStatusCountCard
            title="판매자 검증 현황"
            description="스토어 입점을 위한 판매자 온보딩 단계"
            items={statistics.sellersByVerificationStatus}
            labels={STATISTICS_SELLER_VERIFICATION_STATUS_LABELS}
            emptyMessage="판매자가 없습니다."
          />
        </>
      )}
    </div>
  );
};
