import type { StatusBadgeVariant } from "@/apps/web-admin/common/components/badges/StatusBadge";
import { AdminApprovalStatus } from "@/apps/web-admin/features/admin-management/types/admin-management-account.dto";

const LABELS: Record<AdminApprovalStatus, string> = {
  [AdminApprovalStatus.PENDING]: "승인 대기",
  [AdminApprovalStatus.APPROVED]: "승인",
  [AdminApprovalStatus.REJECTED]: "거절",
};

export function getAdminApprovalStatusLabel(status: AdminApprovalStatus): string {
  return LABELS[status] ?? status;
}

export function getAdminApprovalStatusBadgeVariant(
  status: AdminApprovalStatus,
): StatusBadgeVariant {
  switch (status) {
    case AdminApprovalStatus.PENDING:
      return "warning";
    case AdminApprovalStatus.APPROVED:
      return "success";
    case AdminApprovalStatus.REJECTED:
      return "error";
    default:
      return "default";
  }
}

/** 목록·필터용: 전체 제외 상태 옵션 */
export const ADMIN_APPROVAL_STATUS_FILTER_OPTIONS: {
  value: AdminApprovalStatus;
  label: string;
}[] = [
  { value: AdminApprovalStatus.PENDING, label: LABELS[AdminApprovalStatus.PENDING] },
  { value: AdminApprovalStatus.APPROVED, label: LABELS[AdminApprovalStatus.APPROVED] },
  { value: AdminApprovalStatus.REJECTED, label: LABELS[AdminApprovalStatus.REJECTED] },
];
