import { BaseButton as Button } from "@/apps/web-admin/common/components/buttons/BaseButton";
import {
  LIST_TABLE_CELL,
  LIST_TABLE_CELL_MUTED,
  LIST_TABLE_HEAD,
} from "@/apps/web-admin/common/constants/list-typography.constant";
import { cn } from "@/apps/web-admin/common/utils/classname.util";
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
      <table className="w-full min-w-[480px]">
        <thead>
          <tr className="border-b border-border text-left">
            <th className={cn("px-4 py-3 text-left", LIST_TABLE_HEAD)}>아이디</th>
            <th className={cn("px-4 py-3 text-left", LIST_TABLE_HEAD)}>신청일시</th>
            <th className={cn("px-4 py-3 text-left", LIST_TABLE_HEAD)}>처리</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-border/80 last:border-0">
              <td className={cn("px-4 py-3 font-medium", LIST_TABLE_CELL)}>{item.username}</td>
              <td className={cn("px-4 py-3", LIST_TABLE_CELL_MUTED)}>
                {formatAdminManagementDateTime(item.createdAt)}
              </td>
              <td className={cn("px-4 py-3", LIST_TABLE_CELL)}>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => onApprove(item.id)}
                    disabled={isPending}
                  >
                    승인
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onReject(item.id)}
                    disabled={isPending}
                    className="border-destructive/40 text-destructive hover:bg-destructive/10"
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
