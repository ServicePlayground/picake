import React, { useState } from "react";
import { Card, CardContent } from "@/apps/web-admin/common/components/cards/Card";
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">가입 신청 내역</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            승인 대기 중인 관리자 가입 신청 목록입니다. 승인해야 해당 계정으로 로그인할 수 있습니다.
          </p>
        </div>
        {meta && (
          <span className="text-sm text-muted-foreground">
            총 <span className="font-semibold text-foreground">{meta.totalItems}</span>건
          </span>
        )}
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
            <p className="text-sm text-muted-foreground">승인 대기 중인 가입 신청이 없습니다.</p>
          </CardContent>
        )}

        {!isLoading && !isError && items.length > 0 && meta && (
          <>
            <AdminRegistrationRequestTable
              items={items}
              isPending={isPending}
              onApprove={handleApprove}
              onReject={handleReject}
            />
            <AdminManagementPagination page={page} meta={meta} onPageChange={setPage} />
          </>
        )}
      </Card>
    </div>
  );
};
