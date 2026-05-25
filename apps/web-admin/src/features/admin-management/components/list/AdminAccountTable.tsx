import type { AdminAccountItemResponseDto } from "@/apps/web-admin/features/admin-management/types/admin-management-account.dto";
import {
  ADMIN_APPROVAL_STATUS_BADGE_CLASS,
  ADMIN_APPROVAL_STATUS_LABEL,
} from "@/apps/web-admin/features/admin-management/utils/admin-approval-status.ui.util";
import { formatAdminManagementDateTime } from "@/apps/web-admin/features/admin-management/utils/admin-management-date.util";
import { cn } from "@/apps/web-admin/common/utils/classname.util";

interface AdminAccountTableProps {
  items: AdminAccountItemResponseDto[];
}

export function AdminAccountTable({ items }: AdminAccountTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50/50">
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
              아이디
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
              승인 상태
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
              OTP
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
              마지막 로그인
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
              가입일시
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-zinc-100 last:border-0">
              <td className="px-4 py-3 text-sm font-medium text-zinc-900">{item.username}</td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                    ADMIN_APPROVAL_STATUS_BADGE_CLASS[item.approvalStatus],
                  )}
                >
                  {ADMIN_APPROVAL_STATUS_LABEL[item.approvalStatus]}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-zinc-500">
                {item.isTotpEnabled ? (
                  <span className="text-emerald-600">활성</span>
                ) : (
                  <span className="text-zinc-400">미설정</span>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-zinc-500">
                {formatAdminManagementDateTime(item.lastLoginAt)}
              </td>
              <td className="px-4 py-3 text-sm text-zinc-500">
                {formatAdminManagementDateTime(item.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
