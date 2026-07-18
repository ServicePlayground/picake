import React, { useEffect, useState } from "react";
import { BaseButton as Button } from "@/apps/web-admin/common/components/buttons/BaseButton";
import { Card } from "@/apps/web-admin/common/components/cards/Card";
import { EmptyState } from "@/apps/web-admin/common/components/fallbacks/EmptyState";
import { BaseInput } from "@/apps/web-admin/common/components/inputs/BaseInput";
import { Label } from "@/apps/web-admin/common/components/labels/Label";
import { ContentLoading } from "@/apps/web-admin/common/components/loading/ContentLoading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/apps/web-admin/common/components/selects/Select";
import {
  LIST_CARD,
  LIST_FILTER_PANEL,
  LIST_SCREEN_HEADING,
  LIST_SECTION_GAP,
  LIST_STATS_TEXT,
} from "@/apps/web-admin/common/constants/list-typography.constant";
import { StoreManagementDetailDialog } from "@/apps/web-admin/features/store-management/components/detail/StoreManagementDetailDialog";
import { StoreManagementTable } from "@/apps/web-admin/features/store-management/components/list/StoreManagementTable";
import { StoreManagementPagination } from "@/apps/web-admin/features/store-management/components/shared/StoreManagementPagination";
import { STORE_LIST_PAGE_SIZE } from "@/apps/web-admin/features/store-management/constants/storeManagement.constant";
import { useStoreManagementList } from "@/apps/web-admin/features/store-management/hooks/queries/useStoreManagementQuery";
import type { StoreManagementItemResponseDto } from "@/apps/web-admin/features/store-management/types/store-management.dto";
import type { MemberStatus } from "@/apps/web-admin/features/member-management/types/member-management.dto";
import { MEMBER_STATUS_FILTER_OPTIONS } from "@/apps/web-admin/features/member-management/utils/member-status.ui.util";

export const SellerStoresListPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [sellerStatus, setSellerStatus] = useState<MemberStatus | undefined>(undefined);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [detailStoreId, setDetailStoreId] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [sellerStatus, search]);

  const { data, isLoading } = useStoreManagementList({
    page,
    limit: STORE_LIST_PAGE_SIZE,
    search,
    sellerStatus,
  });

  const items = data?.data ?? [];
  const meta = data?.meta;

  const handleSearch = () => {
    const keyword = searchInput.trim();
    setSearch(keyword ? keyword : undefined);
  };

  const handleViewDetail = (item: StoreManagementItemResponseDto) => {
    setDetailStoreId(item.id);
  };

  return (
    <div className={LIST_SECTION_GAP}>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className={LIST_SCREEN_HEADING}>스토어 관리</h1>
      </div>

      {/* 필터 */}
      <div className={LIST_FILTER_PANEL}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className={LIST_STATS_TEXT}>
            총 <span className="font-semibold text-foreground">{meta?.totalItems ?? 0}</span>개
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
                placeholder="스토어명·사업자·판매자·연락처"
              />
              <Button variant="outline" onClick={handleSearch}>
                검색
              </Button>
            </div>
          </div>
          <div className="min-w-0 space-y-1">
            <Label>판매자 상태</Label>
            <Select
              value={sellerStatus ?? "ALL"}
              onValueChange={(value) =>
                setSellerStatus(value === "ALL" ? undefined : (value as MemberStatus))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="판매자 상태 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체</SelectItem>
                {MEMBER_STATUS_FILTER_OPTIONS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 목록 */}
      {isLoading ? (
        <ContentLoading variant="section" message="스토어를 불러오는 중…" className="py-12" />
      ) : (
        <>
          {items.length === 0 ? (
            <EmptyState message="스토어가 없습니다." />
          ) : (
            <>
              <Card className={LIST_CARD}>
                <StoreManagementTable items={items} onViewDetail={handleViewDetail} />
              </Card>
              {meta && <StoreManagementPagination page={page} meta={meta} onPageChange={setPage} />}
            </>
          )}
        </>
      )}

      <StoreManagementDetailDialog storeId={detailStoreId} onClose={() => setDetailStoreId(null)} />
    </div>
  );
};
