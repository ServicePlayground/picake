import { StatusBadge } from "@/apps/web-admin/common/components/badges/StatusBadge";
import {
  LIST_TABLE_CELL,
  LIST_TABLE_CELL_MUTED,
  LIST_TABLE_HEAD,
} from "@/apps/web-admin/common/constants/list-typography.constant";
import { cn } from "@/apps/web-admin/common/utils/classname.util";
import type { AdminAccountItemResponseDto } from "@/apps/web-admin/features/admin-management/types/admin-management-account.dto";
import {
  getAdminApprovalStatusBadgeVariant,
  getAdminApprovalStatusLabel,
} from "@/apps/web-admin/features/admin-management/utils/admin-approval-status.ui.util";
import { formatAdminManagementDateTime } from "@/apps/web-admin/features/admin-management/utils/admin-management-date.util";

interface AdminAccountTableProps {
  items: AdminAccountItemResponseDto[];
}

export function AdminAccountTable({ items }: AdminAccountTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px]">
        <thead>
          <tr className="border-b border-border text-left">
            <th className={cn("px-4 py-3 text-left", LIST_TABLE_HEAD)}>아이디</th>
            <th className={cn("px-4 py-3 text-left", LIST_TABLE_HEAD)}>승인 상태</th>
            <th className={cn("px-4 py-3 text-left", LIST_TABLE_HEAD)}>OTP</th>
            <th className={cn("px-4 py-3 text-left", LIST_TABLE_HEAD)}>마지막 로그인</th>
            <th className={cn("px-4 py-3 text-left", LIST_TABLE_HEAD)}>가입일시</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-border/80 last:border-0">
              <td className={cn("px-4 py-3 font-medium", LIST_TABLE_CELL)}>{item.username}</td>
              <td className={cn("px-4 py-3", LIST_TABLE_CELL)}>
                <StatusBadge variant={getAdminApprovalStatusBadgeVariant(item.approvalStatus)}>
                  {getAdminApprovalStatusLabel(item.approvalStatus)}
                </StatusBadge>
              </td>
              <td className={cn("px-4 py-3", LIST_TABLE_CELL_MUTED)}>
                {item.isTotpEnabled ? (
                  <span className="font-semibold text-emerald-600">활성</span>
                ) : (
                  "미설정"
                )}
              </td>
              <td className={cn("px-4 py-3", LIST_TABLE_CELL_MUTED)}>
                {formatAdminManagementDateTime(item.lastLoginAt)}
              </td>
              <td className={cn("px-4 py-3", LIST_TABLE_CELL_MUTED)}>
                {formatAdminManagementDateTime(item.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
