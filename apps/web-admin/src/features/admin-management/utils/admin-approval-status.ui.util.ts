import { AdminApprovalStatus } from "@/apps/web-admin/features/admin-management/types/admin-management-account.dto";

export const ADMIN_APPROVAL_STATUS_LABEL: Record<AdminApprovalStatus, string> = {
  [AdminApprovalStatus.PENDING]: "승인 대기",
  [AdminApprovalStatus.APPROVED]: "승인",
  [AdminApprovalStatus.REJECTED]: "거절",
};

export const ADMIN_APPROVAL_STATUS_BADGE_CLASS: Record<AdminApprovalStatus, string> = {
  [AdminApprovalStatus.PENDING]: "bg-amber-100 text-amber-700 border border-amber-200",
  [AdminApprovalStatus.APPROVED]: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  [AdminApprovalStatus.REJECTED]: "bg-red-100 text-red-600 border border-red-200",
};

export const ADMIN_ACCOUNT_STATUS_FILTER_OPTIONS: {
  label: string;
  value: AdminApprovalStatus | "";
}[] = [
  { label: "전체", value: "" },
  { label: ADMIN_APPROVAL_STATUS_LABEL[AdminApprovalStatus.PENDING], value: AdminApprovalStatus.PENDING },
  { label: ADMIN_APPROVAL_STATUS_LABEL[AdminApprovalStatus.APPROVED], value: AdminApprovalStatus.APPROVED },
  { label: ADMIN_APPROVAL_STATUS_LABEL[AdminApprovalStatus.REJECTED], value: AdminApprovalStatus.REJECTED },
];
