import React, { useState } from "react";
import { Card, CardContent } from "@/apps/web-admin/common/components/cards/Card";
import { AdminAccountTable } from "@/apps/web-admin/features/admin-management/components/list/AdminAccountTable";
import { AdminManagementPagination } from "@/apps/web-admin/features/admin-management/components/shared/AdminManagementPagination";
import { ADMIN_ACCOUNT_LIST_PAGE_SIZE } from "@/apps/web-admin/features/admin-management/constants/adminManagement.constant";
import { useAdminAccountList } from "@/apps/web-admin/features/admin-management/hooks/queries/useAdminManagementQuery";
import { AdminApprovalStatus } from "@/apps/web-admin/features/admin-management/types/admin-management-account.dto";
import { ADMIN_ACCOUNT_STATUS_FILTER_OPTIONS } from "@/apps/web-admin/features/admin-management/utils/admin-approval-status.ui.util";
import { cn } from "@/apps/web-admin/common/utils/classname.util";

export const AdminAccountsListPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<AdminApprovalStatus | "">("");

  const { data, isLoading, isError } = useAdminAccountList({
    page,
    limit: ADMIN_ACCOUNT_LIST_PAGE_SIZE,
    approvalStatus: statusFilter || undefined,
  });

  const items = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">계정 관리</h1>
          <p className="mt-1 text-sm text-muted-foreground">관리자 전체 계정 내역입니다.</p>
        </div>
        {meta && (
          <span className="text-sm text-muted-foreground">
            총 <span className="font-semibold text-foreground">{meta.totalItems}</span>개
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {ADMIN_ACCOUNT_STATUS_FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value || "all"}
            type="button"
            onClick={() => {
              setStatusFilter(opt.value);
              setPage(1);
            }}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              statusFilter === opt.value
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <Card className="shadow-sm">
        {isLoading && (
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            불러오는 중...
          </CardContent>
        )}

        {isError && (
          <CardContent className="py-16 text-center text-sm text-destructive">
            데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
          </CardContent>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <CardContent className="py-16 text-center">
            <p className="text-sm text-muted-foreground">계정이 없습니다.</p>
          </CardContent>
        )}

        {!isLoading && !isError && items.length > 0 && meta && (
          <>
            <AdminAccountTable items={items} />
            <AdminManagementPagination page={page} meta={meta} onPageChange={setPage} />
          </>
        )}
      </Card>
    </div>
  );
};
