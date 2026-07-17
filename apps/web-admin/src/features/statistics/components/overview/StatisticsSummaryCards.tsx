import React from "react";
import { ShoppingBag, Store as StoreIcon, Users, Wallet } from "lucide-react";
import { StatisticsSummaryCard } from "@/apps/web-admin/features/statistics/components/shared/StatisticsSummaryCard";
import type { AdminStatisticsOverviewResponseDto } from "@/apps/web-admin/features/statistics/types/statistics.dto";
import { buildSignupSummaryRows } from "@/apps/web-admin/features/statistics/utils/statistics-summary.ui.util";

interface StatisticsSummaryCardsProps {
  overview: AdminStatisticsOverviewResponseDto;
}

/** 전체 현황 요약 카드 그리드 (구매자·판매자 가입, 스토어, GMV) */
export const StatisticsSummaryCards: React.FC<StatisticsSummaryCardsProps> = ({ overview }) => {
  const { consumers, sellers, stores, orders } = overview;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatisticsSummaryCard
        icon={<Users className="h-4 w-4" />}
        title="구매자 가입"
        value={consumers.total.toLocaleString()}
        rows={buildSignupSummaryRows(consumers)}
      />
      <StatisticsSummaryCard
        icon={<StoreIcon className="h-4 w-4" />}
        title="판매자 가입"
        value={sellers.total.toLocaleString()}
        rows={buildSignupSummaryRows(sellers)}
      />
      <StatisticsSummaryCard
        icon={<ShoppingBag className="h-4 w-4" />}
        title="스토어"
        value={stores.total.toLocaleString()}
        footnote="등록된 전체 스토어 수"
      />
      <StatisticsSummaryCard
        icon={<Wallet className="h-4 w-4" />}
        title="GMV (픽업 완료 기준)"
        value={`${orders.gmv.toLocaleString()}원`}
        rows={[{ label: "총 주문 수 (모든 상태)", value: `${orders.total.toLocaleString()}건` }]}
      />
    </div>
  );
};
