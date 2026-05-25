import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";
import { BaseButton as Button } from "@/apps/web-admin/common/components/buttons/BaseButton";
import { StatusBadge } from "@/apps/web-admin/common/components/badges/StatusBadge";
import {
  LIST_TABLE_CELL,
  LIST_TABLE_CELL_MUTED,
  LIST_TABLE_HEAD,
} from "@/apps/web-admin/common/constants/list-typography.constant";
import { cn } from "@/apps/web-admin/common/utils/classname.util";
import type { HomeBannerItemResponseDto } from "@/apps/web-admin/features/home-banner/types/home-banner.dto";
import {
  formatHomeBannerPeriodRange,
  getHomeBannerPeriodStatus,
  getHomeBannerPeriodStatusBadgeVariant,
  getHomeBannerPeriodStatusLabel,
} from "@/apps/web-admin/features/home-banner/utils/home-banner-period.ui.util";

interface HomeBannerTableProps {
  items: HomeBannerItemResponseDto[];
  isBusy: boolean;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onEdit: (item: HomeBannerItemResponseDto) => void;
  onDelete: (id: string) => void;
}

export function HomeBannerTable({
  items,
  isBusy,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
}: HomeBannerTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px]">
        <thead>
          <tr className="border-b border-border text-left">
            <th className={cn("px-4 py-3 text-left", LIST_TABLE_HEAD)}>순서</th>
            <th className={cn("px-4 py-3 text-left", LIST_TABLE_HEAD)}>미리보기</th>
            <th className={cn("px-4 py-3 text-left", LIST_TABLE_HEAD)}>상태</th>
            <th className={cn("px-4 py-3 text-left", LIST_TABLE_HEAD)}>노출 기간</th>
            <th className={cn("px-4 py-3 text-left", LIST_TABLE_HEAD)}>링크</th>
            <th className={cn("px-4 py-3 text-right", LIST_TABLE_HEAD)}>관리</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const status = getHomeBannerPeriodStatus(item);
            return (
              <tr key={item.id} className="border-b border-border/80 last:border-0">
                <td className={cn("px-4 py-3", LIST_TABLE_CELL)}>
                  <div className="flex items-center gap-0.5">
                    <span className="mr-2 w-4 text-center font-semibold tabular-nums">
                      {index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={isBusy || index === 0}
                      onClick={() => onMoveUp(index)}
                      className="h-8 w-8"
                      aria-label="위로"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={isBusy || index === items.length - 1}
                      onClick={() => onMoveDown(index)}
                      className="h-8 w-8"
                      aria-label="아래로"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
                <td className={cn("px-4 py-3", LIST_TABLE_CELL)}>
                  <div className="h-14 w-[100px] overflow-hidden rounded-md border border-border bg-muted">
                    <img
                      src={item.imageUrl}
                      alt={`배너 ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </td>
                <td className={cn("px-4 py-3", LIST_TABLE_CELL)}>
                  <StatusBadge variant={getHomeBannerPeriodStatusBadgeVariant(status)}>
                    {getHomeBannerPeriodStatusLabel(status)}
                  </StatusBadge>
                </td>
                <td className={cn("px-4 py-3 whitespace-nowrap", LIST_TABLE_CELL_MUTED)}>
                  {formatHomeBannerPeriodRange(item.startsAt, item.endsAt)}
                </td>
                <td className={cn("max-w-[160px] truncate px-4 py-3", LIST_TABLE_CELL_MUTED)}>
                  {item.linkUrl ?? "—"}
                </td>
                <td className={cn("px-4 py-3", LIST_TABLE_CELL)}>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={isBusy}
                      onClick={() => onEdit(item)}
                      className="h-8 w-8"
                      aria-label="수정"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={isBusy}
                      onClick={() => onDelete(item.id)}
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      aria-label="삭제"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
