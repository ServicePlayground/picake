import { BaseButton as Button } from "@/apps/web-admin/common/components/buttons/BaseButton";
import { StatusBadge } from "@/apps/web-admin/common/components/badges/StatusBadge";
import {
  LIST_TABLE_CELL,
  LIST_TABLE_CELL_MUTED,
  LIST_TABLE_HEAD,
} from "@/apps/web-admin/common/constants/list-typography.constant";
import { cn } from "@/apps/web-admin/common/utils/classname.util";
import type { MemberSellerItemResponseDto } from "@/apps/web-admin/features/member-management/types/member-management.dto";
import { formatMemberManagementDateTime } from "@/apps/web-admin/features/member-management/utils/member-management-date.util";
import {
  getMemberStatus,
  getMemberStatusBadgeVariant,
  getMemberStatusLabel,
  getSellerVerificationStatusBadgeVariant,
  getSellerVerificationStatusLabel,
  getSocialProvidersLabel,
} from "@/apps/web-admin/features/member-management/utils/member-status.ui.util";

interface MemberSellerTableProps {
  items: MemberSellerItemResponseDto[];
  onToggleActive: (item: MemberSellerItemResponseDto) => void;
  isBusy: boolean;
}

export function MemberSellerTable({ items, onToggleActive, isBusy }: MemberSellerTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[960px]">
        <thead>
          <tr className="border-b border-border text-left">
            <th className={cn("px-4 py-3 text-left", LIST_TABLE_HEAD)}>닉네임 / 이름</th>
            <th className={cn("px-4 py-3 text-left", LIST_TABLE_HEAD)}>휴대폰</th>
            <th className={cn("px-4 py-3 text-left", LIST_TABLE_HEAD)}>소셜 연동</th>
            <th className={cn("px-4 py-3 text-left", LIST_TABLE_HEAD)}>검증 상태</th>
            <th className={cn("px-4 py-3 text-left", LIST_TABLE_HEAD)}>스토어</th>
            <th className={cn("px-4 py-3 text-left", LIST_TABLE_HEAD)}>세그먼트</th>
            <th className={cn("px-4 py-3 text-left", LIST_TABLE_HEAD)}>상태</th>
            <th className={cn("px-4 py-3 text-left", LIST_TABLE_HEAD)}>가입일시</th>
            <th className={cn("px-4 py-3 text-left", LIST_TABLE_HEAD)}>관리</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const status = getMemberStatus(item);
            const isWithdrawn = Boolean(item.withdrawnAt);
            return (
              <tr key={item.id} className="border-b border-border/80 last:border-0">
                <td className={cn("px-4 py-3", LIST_TABLE_CELL)}>
                  <div className="font-medium">{item.nickname ?? "-"}</div>
                  <div className="text-xs text-muted-foreground">{item.name ?? "-"}</div>
                </td>
                <td className={cn("px-4 py-3", LIST_TABLE_CELL_MUTED)}>{item.phone}</td>
                <td className={cn("px-4 py-3", LIST_TABLE_CELL_MUTED)}>
                  {getSocialProvidersLabel(item)}
                </td>
                <td className={cn("px-4 py-3", LIST_TABLE_CELL)}>
                  <StatusBadge
                    variant={getSellerVerificationStatusBadgeVariant(item.sellerVerificationStatus)}
                  >
                    {getSellerVerificationStatusLabel(item.sellerVerificationStatus)}
                  </StatusBadge>
                </td>
                <td className={cn("px-4 py-3", LIST_TABLE_CELL_MUTED)}>
                  {item.stores.length > 0 ? item.stores.map((store) => store.name).join(", ") : "-"}
                </td>
                <td className={cn("px-4 py-3", LIST_TABLE_CELL)}>
                  {item.segments.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {item.segments.map((segment) => (
                        <StatusBadge key={segment.key} variant="info">
                          {segment.label}
                        </StatusBadge>
                      ))}
                    </div>
                  ) : (
                    <span className={LIST_TABLE_CELL_MUTED}>-</span>
                  )}
                </td>
                <td className={cn("px-4 py-3", LIST_TABLE_CELL)}>
                  <StatusBadge variant={getMemberStatusBadgeVariant(status)}>
                    {getMemberStatusLabel(status)}
                  </StatusBadge>
                </td>
                <td className={cn("px-4 py-3", LIST_TABLE_CELL_MUTED)}>
                  {formatMemberManagementDateTime(item.createdAt)}
                </td>
                <td className={cn("px-4 py-3", LIST_TABLE_CELL)}>
                  {!isWithdrawn && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onToggleActive(item)}
                      disabled={isBusy}
                    >
                      {item.isActive ? "비활성 처리" : "활성 처리"}
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
