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
import { MemberSellerTable } from "@/apps/web-admin/features/member-management/components/list/MemberSellerTable";
import { MemberManagementPagination } from "@/apps/web-admin/features/member-management/components/shared/MemberManagementPagination";
import { MEMBER_LIST_PAGE_SIZE } from "@/apps/web-admin/features/member-management/constants/memberManagement.constant";
import { useUpdateMemberSellerActive } from "@/apps/web-admin/features/member-management/hooks/mutations/useMemberManagementMutation";
import { useMemberSellerList } from "@/apps/web-admin/features/member-management/hooks/queries/useMemberManagementQuery";
import type {
  MemberSellerItemResponseDto,
  MemberStatus,
  SellerVerificationStatus,
} from "@/apps/web-admin/features/member-management/types/member-management.dto";
import {
  MEMBER_STATUS_FILTER_OPTIONS,
  SELLER_VERIFICATION_STATUS_FILTER_OPTIONS,
} from "@/apps/web-admin/features/member-management/utils/member-status.ui.util";

export const SellerMembersListPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<MemberStatus | undefined>(undefined);
  const [verificationStatus, setVerificationStatus] = useState<
    SellerVerificationStatus | undefined
  >(undefined);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState<string | undefined>(undefined);

  useEffect(() => {
    setPage(1);
  }, [status, verificationStatus, search]);

  const { data, isLoading } = useMemberSellerList({
    page,
    limit: MEMBER_LIST_PAGE_SIZE,
    search,
    status,
    verificationStatus,
  });
  const updateActiveMutation = useUpdateMemberSellerActive();

  const items = data?.data ?? [];
  const meta = data?.meta;
  const isBusy = updateActiveMutation.isPending;

  const handleSearch = () => {
    const keyword = searchInput.trim();
    setSearch(keyword ? keyword : undefined);
  };

  const handleToggleActive = (item: MemberSellerItemResponseDto) => {
    const nextActive = !item.isActive;
    const label = nextActive ? "활성" : "비활성";
    const name = item.nickname ?? item.name ?? item.phone;
    if (!window.confirm(`'${name}' 판매자 계정을 ${label} 처리할까요?`)) return;
    updateActiveMutation.mutate({ sellerId: item.id, dto: { isActive: nextActive } });
  };

  return (
    <div className={LIST_SECTION_GAP}>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className={LIST_SCREEN_HEADING}>회원 관리</h1>
      </div>

      {/* 필터 */}
      <div className={LIST_FILTER_PANEL}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className={LIST_STATS_TEXT}>
            총 <span className="font-semibold text-foreground">{meta?.totalItems ?? 0}</span>명
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
                placeholder="이름·닉네임·휴대폰 번호"
              />
              <Button variant="outline" onClick={handleSearch}>
                검색
              </Button>
            </div>
          </div>
          <div className="min-w-0 space-y-1">
            <Label>상태</Label>
            <Select
              value={status ?? "ALL"}
              onValueChange={(value) =>
                setStatus(value === "ALL" ? undefined : (value as MemberStatus))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="상태 선택" />
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
          <div className="min-w-0 space-y-1">
            <Label>검증 상태</Label>
            <Select
              value={verificationStatus ?? "ALL"}
              onValueChange={(value) =>
                setVerificationStatus(
                  value === "ALL" ? undefined : (value as SellerVerificationStatus),
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="검증 상태 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체</SelectItem>
                {SELLER_VERIFICATION_STATUS_FILTER_OPTIONS.map(({ value, label }) => (
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
        <ContentLoading variant="section" message="판매자를 불러오는 중…" className="py-12" />
      ) : (
        <>
          {items.length === 0 ? (
            <EmptyState message="판매자가 없습니다." />
          ) : (
            <>
              <Card className={LIST_CARD}>
                <MemberSellerTable
                  items={items}
                  onToggleActive={handleToggleActive}
                  isBusy={isBusy}
                />
              </Card>
              {meta && (
                <MemberManagementPagination page={page} meta={meta} onPageChange={setPage} />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};
