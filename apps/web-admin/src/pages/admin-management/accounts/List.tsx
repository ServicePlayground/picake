import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/apps/web-admin/common/components/selects/Select";
import { Label } from "@/apps/web-admin/common/components/labels/Label";
import { Card } from "@/apps/web-admin/common/components/cards/Card";
import { EmptyState } from "@/apps/web-admin/common/components/fallbacks/EmptyState";
import { ContentLoading } from "@/apps/web-admin/common/components/loading/ContentLoading";
import {
  LIST_CARD,
  LIST_FILTER_PANEL,
  LIST_SCREEN_HEADING,
  LIST_SECTION_GAP,
  LIST_STATS_TEXT,
} from "@/apps/web-admin/common/constants/list-typography.constant";
import { AdminAccountTable } from "@/apps/web-admin/features/admin-management/components/list/AdminAccountTable";
import { AdminManagementPagination } from "@/apps/web-admin/features/admin-management/components/shared/AdminManagementPagination";
import { ADMIN_ACCOUNT_LIST_PAGE_SIZE } from "@/apps/web-admin/features/admin-management/constants/adminManagement.constant";
import { useAdminAccountList } from "@/apps/web-admin/features/admin-management/hooks/queries/useAdminManagementQuery";
import { AdminApprovalStatus } from "@/apps/web-admin/features/admin-management/types/admin-management-account.dto";
import { ADMIN_APPROVAL_STATUS_FILTER_OPTIONS } from "@/apps/web-admin/features/admin-management/utils/admin-approval-status.ui.util";

export const AdminAccountsListPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [approvalStatus, setApprovalStatus] = useState<AdminApprovalStatus | undefined>(undefined);

  useEffect(() => {
    setPage(1);
  }, [approvalStatus]);

  const { data, isLoading, isError } = useAdminAccountList({
    page,
    limit: ADMIN_ACCOUNT_LIST_PAGE_SIZE,
    approvalStatus,
  });

  const items = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className={LIST_SECTION_GAP}>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className={LIST_SCREEN_HEADING}>계정 관리</h1>
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
            <Label>승인 상태</Label>
            <Select
              value={approvalStatus ?? "ALL"}
              onValueChange={(value) =>
                setApprovalStatus(value === "ALL" ? undefined : (value as AdminApprovalStatus))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="상태 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체</SelectItem>
                {ADMIN_APPROVAL_STATUS_FILTER_OPTIONS.map(({ value, label }) => (
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
        <ContentLoading variant="section" message="계정을 불러오는 중…" className="py-12" />
      ) : isError ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-destructive">
            데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
          </div>
        </div>
      ) : (
        <>
          {items.length === 0 ? (
            <EmptyState message="계정이 없습니다." />
          ) : (
            <>
              <Card className={LIST_CARD}>
                <AdminAccountTable items={items} />
              </Card>
              {meta && (
                <AdminManagementPagination page={page} meta={meta} onPageChange={setPage} />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};
