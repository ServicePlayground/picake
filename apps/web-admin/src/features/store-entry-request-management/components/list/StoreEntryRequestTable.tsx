import { BaseButton as Button } from "@/apps/web-admin/common/components/buttons/BaseButton";
import {
  LIST_TABLE_CELL,
  LIST_TABLE_CELL_MUTED,
  LIST_TABLE_HEAD,
} from "@/apps/web-admin/common/constants/list-typography.constant";
import { cn } from "@/apps/web-admin/common/utils/classname.util";
import type { StoreEntryRequestItemResponseDto } from "@/apps/web-admin/features/store-entry-request-management/types/store-entry-request-management.dto";
import {
  formatStoreEntryRequestAddress,
  formatStoreEntryRequestDateTime,
} from "@/apps/web-admin/features/store-entry-request-management/utils/store-entry-request-date.util";

interface StoreEntryRequestTableProps {
  items: StoreEntryRequestItemResponseDto[];
  onViewDetail: (item: StoreEntryRequestItemResponseDto) => void;
}

export function StoreEntryRequestTable({ items, onViewDetail }: StoreEntryRequestTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[960px]">
        <thead>
          <tr className="border-b border-border text-left">
            <th className={cn("px-4 py-3 text-left", LIST_TABLE_HEAD)}>장소(스토어)</th>
            <th className={cn("px-4 py-3 text-left", LIST_TABLE_HEAD)}>카테고리</th>
            <th className={cn("px-4 py-3 text-left", LIST_TABLE_HEAD)}>연락처</th>
            <th className={cn("px-4 py-3 text-left", LIST_TABLE_HEAD)}>요청자</th>
            <th className={cn("px-4 py-3 text-right", LIST_TABLE_HEAD)}>동일 장소 요청</th>
            <th className={cn("px-4 py-3 text-left", LIST_TABLE_HEAD)}>요청일시</th>
            <th className={cn("px-4 py-3 text-left", LIST_TABLE_HEAD)}>관리</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-border/80 last:border-0">
              <td className={cn("px-4 py-3", LIST_TABLE_CELL)}>
                <div className="font-medium">{item.placeName}</div>
                <div className="text-xs text-muted-foreground">
                  {formatStoreEntryRequestAddress(item)}
                </div>
              </td>
              <td className={cn("px-4 py-3", LIST_TABLE_CELL_MUTED)}>{item.categoryName ?? "-"}</td>
              <td className={cn("px-4 py-3", LIST_TABLE_CELL_MUTED)}>{item.phone ?? "-"}</td>
              <td className={cn("px-4 py-3", LIST_TABLE_CELL)}>
                <div className="font-medium">
                  {item.consumer.nickname ?? item.consumer.name ?? "-"}
                </div>
                <div className="text-xs text-muted-foreground">{item.consumer.phone}</div>
              </td>
              <td className={cn("px-4 py-3 text-right", LIST_TABLE_CELL_MUTED)}>
                {item.samePlaceRequestCount.toLocaleString()}건
              </td>
              <td className={cn("px-4 py-3", LIST_TABLE_CELL_MUTED)}>
                {formatStoreEntryRequestDateTime(item.createdAt)}
              </td>
              <td className={cn("px-4 py-3", LIST_TABLE_CELL)}>
                <Button variant="outline" size="sm" onClick={() => onViewDetail(item)}>
                  상세
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
