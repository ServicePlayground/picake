import { BaseButton as Button } from "@/apps/web-admin/common/components/buttons/BaseButton";
import { StatusBadge } from "@/apps/web-admin/common/components/badges/StatusBadge";
import {
  LIST_TABLE_CELL,
  LIST_TABLE_CELL_MUTED,
  LIST_TABLE_HEAD,
} from "@/apps/web-admin/common/constants/list-typography.constant";
import { cn } from "@/apps/web-admin/common/utils/classname.util";
import type { StoreManagementItemResponseDto } from "@/apps/web-admin/features/store-management/types/store-management.dto";
import {
  formatStoreAddress,
  formatStoreManagementDateTime,
} from "@/apps/web-admin/features/store-management/utils/store-management-date.util";
import {
  getMemberStatus,
  getMemberStatusBadgeVariant,
  getMemberStatusLabel,
  getSellerVerificationStatusBadgeVariant,
  getSellerVerificationStatusLabel,
} from "@/apps/web-admin/features/member-management/utils/member-status.ui.util";

interface StoreManagementTableProps {
  items: StoreManagementItemResponseDto[];
  onViewDetail: (item: StoreManagementItemResponseDto) => void;
}

export function StoreManagementTable({ items, onViewDetail }: StoreManagementTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1080px]">
        <thead>
          <tr className="border-b border-border text-left">
            <th className={cn("px-4 py-3 text-left", LIST_TABLE_HEAD)}>스토어</th>
            <th className={cn("px-4 py-3 text-left", LIST_TABLE_HEAD)}>사업자</th>
            <th className={cn("px-4 py-3 text-left", LIST_TABLE_HEAD)}>판매자</th>
            <th className={cn("px-4 py-3 text-left", LIST_TABLE_HEAD)}>검증 상태</th>
            <th className={cn("px-4 py-3 text-left", LIST_TABLE_HEAD)}>판매자 상태</th>
            <th className={cn("px-4 py-3 text-right", LIST_TABLE_HEAD)}>상품</th>
            <th className={cn("px-4 py-3 text-right", LIST_TABLE_HEAD)}>전체 주문</th>
            <th className={cn("px-4 py-3 text-right", LIST_TABLE_HEAD)}>좋아요</th>
            <th className={cn("px-4 py-3 text-left", LIST_TABLE_HEAD)}>등록일시</th>
            <th className={cn("px-4 py-3 text-left", LIST_TABLE_HEAD)}>관리</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const sellerStatus = getMemberStatus(item.seller);
            return (
              <tr key={item.id} className="border-b border-border/80 last:border-0">
                <td className={cn("px-4 py-3", LIST_TABLE_CELL)}>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-muted-foreground">{formatStoreAddress(item)}</div>
                </td>
                <td className={cn("px-4 py-3", LIST_TABLE_CELL)}>
                  <div className="font-medium">{item.businessName}</div>
                  <div className="text-xs text-muted-foreground">{item.businessNo}</div>
                </td>
                <td className={cn("px-4 py-3", LIST_TABLE_CELL)}>
                  <div className="font-medium">
                    {item.seller.nickname ?? item.seller.name ?? "-"}
                  </div>
                  <div className="text-xs text-muted-foreground">{item.seller.phone}</div>
                </td>
                <td className={cn("px-4 py-3", LIST_TABLE_CELL)}>
                  <StatusBadge
                    variant={getSellerVerificationStatusBadgeVariant(
                      item.seller.sellerVerificationStatus,
                    )}
                  >
                    {getSellerVerificationStatusLabel(item.seller.sellerVerificationStatus)}
                  </StatusBadge>
                </td>
                <td className={cn("px-4 py-3", LIST_TABLE_CELL)}>
                  <StatusBadge variant={getMemberStatusBadgeVariant(sellerStatus)}>
                    {getMemberStatusLabel(sellerStatus)}
                  </StatusBadge>
                </td>
                <td className={cn("px-4 py-3 text-right", LIST_TABLE_CELL_MUTED)}>
                  {item.productCount.toLocaleString()}
                </td>
                <td className={cn("px-4 py-3 text-right", LIST_TABLE_CELL_MUTED)}>
                  {item.orderCount.toLocaleString()}
                </td>
                <td className={cn("px-4 py-3 text-right", LIST_TABLE_CELL_MUTED)}>
                  {item.likeCount.toLocaleString()}
                </td>
                <td className={cn("px-4 py-3", LIST_TABLE_CELL_MUTED)}>
                  {formatStoreManagementDateTime(item.createdAt)}
                </td>
                <td className={cn("px-4 py-3", LIST_TABLE_CELL)}>
                  <Button variant="outline" size="sm" onClick={() => onViewDetail(item)}>
                    상세
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
