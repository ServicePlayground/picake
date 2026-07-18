import React, { useEffect, useState } from "react";
import { Inbox } from "lucide-react";
import { BaseButton as Button } from "@/apps/web-admin/common/components/buttons/BaseButton";
import { Card } from "@/apps/web-admin/common/components/cards/Card";
import { EmptyState } from "@/apps/web-admin/common/components/fallbacks/EmptyState";
import { BaseInput } from "@/apps/web-admin/common/components/inputs/BaseInput";
import { Label } from "@/apps/web-admin/common/components/labels/Label";
import { ContentLoading } from "@/apps/web-admin/common/components/loading/ContentLoading";
import {
  LIST_CARD,
  LIST_FILTER_PANEL,
  LIST_SCREEN_HEADING,
  LIST_SECTION_GAP,
  LIST_STATS_TEXT,
} from "@/apps/web-admin/common/constants/list-typography.constant";
import { StatisticsSummaryCard } from "@/apps/web-admin/features/statistics/components/shared/StatisticsSummaryCard";
import { StatisticsTrendsCard } from "@/apps/web-admin/features/statistics/components/trends/StatisticsTrendsCard";
import { useStatisticsStoreEntryRequests } from "@/apps/web-admin/features/statistics/hooks/queries/useStatisticsQuery";
import { StoreEntryRequestDetailDialog } from "@/apps/web-admin/features/store-entry-request-management/components/detail/StoreEntryRequestDetailDialog";
import { StoreEntryRequestTable } from "@/apps/web-admin/features/store-entry-request-management/components/list/StoreEntryRequestTable";
import { StoreEntryRequestPagination } from "@/apps/web-admin/features/store-entry-request-management/components/shared/StoreEntryRequestPagination";
import { STORE_ENTRY_REQUEST_LIST_PAGE_SIZE } from "@/apps/web-admin/features/store-entry-request-management/constants/storeEntryRequestManagement.constant";
import { useStoreEntryRequestList } from "@/apps/web-admin/features/store-entry-request-management/hooks/queries/useStoreEntryRequestManagementQuery";
import type { StoreEntryRequestItemResponseDto } from "@/apps/web-admin/features/store-entry-request-management/types/store-entry-request-management.dto";

/**
 * 통계 > 입점 통계
 *
 * 입점 요청 등록 현황·추이와 요청 장소(스토어) 목록을 봅니다.
 */
export const StatisticsStoreEntryRequestsPage: React.FC = () => {
  const { data: statistics, isLoading: isStatisticsLoading } = useStatisticsStoreEntryRequests();
  const entryRequests = statistics?.storeEntryRequests;

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [detailRequestId, setDetailRequestId] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const { data: listData, isLoading: isListLoading } = useStoreEntryRequestList({
    page,
    limit: STORE_ENTRY_REQUEST_LIST_PAGE_SIZE,
    search,
  });

  const items = listData?.data ?? [];
  const meta = listData?.meta;

  const handleSearch = () => {
    const keyword = searchInput.trim();
    setSearch(keyword ? keyword : undefined);
  };

  const handleViewDetail = (item: StoreEntryRequestItemResponseDto) => {
    setDetailRequestId(item.id);
  };

  return (
    <div className={LIST_SECTION_GAP}>
      <h1 className={LIST_SCREEN_HEADING}>입점 통계</h1>

      {isStatisticsLoading && (
        <ContentLoading variant="section" message="현황을 불러오는 중…" className="py-12" />
      )}

      {!isStatisticsLoading && !entryRequests && (
        <EmptyState message="현황 데이터를 불러오지 못했습니다." />
      )}

      {entryRequests && (
        <>
          <StatisticsSummaryCard
            icon={<Inbox className="h-4 w-4" />}
            title="입점 요청"
            value={`${entryRequests.total.toLocaleString()}건`}
            rows={[
              { label: "오늘 신규", value: `${entryRequests.today.toLocaleString()}건` },
              {
                label: "최근 7일",
                value: `${entryRequests.last7Days.toLocaleString()}건`,
              },
              {
                label: "최근 30일",
                value: `${entryRequests.last30Days.toLocaleString()}건`,
              },
            ]}
          />

          <StatisticsTrendsCard
            title="입점 요청 추이"
            description="일별 입점 요청 수 (Asia/Seoul 달력일 기준)"
            charts={["entryRequests"]}
          />
        </>
      )}

      {/* 요청 장소 목록 */}
      <div className={LIST_FILTER_PANEL}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className={LIST_STATS_TEXT}>
            요청 장소 <span className="font-semibold text-foreground">{meta?.totalItems ?? 0}</span>
            건
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="min-w-0 space-y-1">
            <Label>검색</Label>
            <div className="flex gap-2">
              <BaseInput
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                placeholder="장소명·주소·연락처·카테고리"
              />
              <Button variant="outline" onClick={handleSearch}>
                검색
              </Button>
            </div>
          </div>
        </div>
      </div>

      {isListLoading ? (
        <ContentLoading variant="section" message="입점 요청을 불러오는 중…" className="py-12" />
      ) : items.length === 0 ? (
        <EmptyState message="입점 요청이 없습니다." />
      ) : (
        <>
          <Card className={LIST_CARD}>
            <StoreEntryRequestTable items={items} onViewDetail={handleViewDetail} />
          </Card>
          {meta && <StoreEntryRequestPagination page={page} meta={meta} onPageChange={setPage} />}
        </>
      )}

      <StoreEntryRequestDetailDialog
        requestId={detailRequestId}
        onClose={() => setDetailRequestId(null)}
      />
    </div>
  );
};
