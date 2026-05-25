import React, { useState } from "react";
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
import { AdminRegistrationRequestTable } from "@/apps/web-admin/features/admin-management/components/list/AdminRegistrationRequestTable";
import { AdminApprovalStatus } from "@/apps/web-admin/features/admin-management/types/admin-management-account.dto";
import { AdminManagementPagination } from "@/apps/web-admin/features/admin-management/components/shared/AdminManagementPagination";
import { ADMIN_ACCOUNT_LIST_PAGE_SIZE } from "@/apps/web-admin/features/admin-management/constants/adminManagement.constant";
import { useUpdateAdminRegistrationApproval } from "@/apps/web-admin/features/admin-management/hooks/mutations/useAdminManagementMutation";
import { useAdminRegistrationRequestList } from "@/apps/web-admin/features/admin-management/hooks/queries/useAdminManagementQuery";

export const AdminRequestsListPage: React.FC = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useAdminRegistrationRequestList({
    page,
    limit: ADMIN_ACCOUNT_LIST_PAGE_SIZE,
  });
  const { mutate: updateApproval, isPending } = useUpdateAdminRegistrationApproval();

  const items = data?.data ?? [];
  const meta = data?.meta;

  const handleApprove = (adminId: string) => {
    updateApproval({ adminId, dto: { approvalStatus: AdminApprovalStatus.APPROVED } });
  };

  const handleReject = (adminId: string) => {
    if (!confirm("이 계정의 가입 신청을 거절하시겠습니까?")) return;
    updateApproval({ adminId, dto: { approvalStatus: AdminApprovalStatus.REJECTED } });
  };

  return (
    <div className={LIST_SECTION_GAP}>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className={LIST_SCREEN_HEADING}>가입 신청 내역</h1>
      </div>

      {/* 안내 */}
      <div className={LIST_FILTER_PANEL}>
        <p className="text-sm text-muted-foreground">
          승인 대기 중인 관리자 가입 신청 목록입니다. 승인해야 해당 계정으로 로그인할 수 있습니다.
        </p>
        {meta && (
          <p className={LIST_STATS_TEXT}>
            총 <span className="font-semibold text-foreground">{meta.totalItems}</span>건
          </p>
        )}
      </div>

      {/* 목록 */}
      {isLoading ? (
        <ContentLoading variant="section" message="가입 신청을 불러오는 중…" className="py-12" />
      ) : isError ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-destructive">
            데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
          </div>
        </div>
      ) : (
        <>
          {items.length === 0 ? (
            <EmptyState message="승인 대기 중인 가입 신청이 없습니다." />
          ) : (
            <>
              <Card className={LIST_CARD}>
                <AdminRegistrationRequestTable
                  items={items}
                  isPending={isPending}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
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
