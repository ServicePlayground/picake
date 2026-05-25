import { BaseButton as Button } from "@/apps/web-admin/common/components/buttons/BaseButton";
import type { AdminAccountItemResponseDto } from "@/apps/web-admin/features/admin-management/types/admin-management-account.dto";
import { formatAdminManagementDateTime } from "@/apps/web-admin/features/admin-management/utils/admin-management-date.util";

interface AdminRegistrationRequestTableProps {
  items: AdminAccountItemResponseDto[];
  isPending: boolean;
  onApprove: (adminId: string) => void;
  onReject: (adminId: string) => void;
}

export function AdminRegistrationRequestTable({
  items,
  isPending,
  onApprove,
  onReject,
}: AdminRegistrationRequestTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50/50">
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
              아이디
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
              신청일시
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
              처리
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-zinc-100 last:border-0">
              <td className="px-4 py-3 text-sm font-medium text-zinc-900">{item.username}</td>
              <td className="px-4 py-3 text-sm text-zinc-500">
                {formatAdminManagementDateTime(item.createdAt)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => onApprove(item.id)}
                    disabled={isPending}
                    className="h-7 px-3 text-xs"
                  >
                    승인
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onReject(item.id)}
                    disabled={isPending}
                    className="h-7 border-red-300 px-3 text-xs text-red-600 hover:bg-red-50"
                  >
                    거절
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
