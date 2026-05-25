import { Pencil, Pin, Trash2 } from "lucide-react";
import { BaseButton as Button } from "@/apps/web-admin/common/components/buttons/BaseButton";
import { StatusBadge } from "@/apps/web-admin/common/components/badges/StatusBadge";
import {
  LIST_TABLE_CELL,
  LIST_TABLE_CELL_MUTED,
  LIST_TABLE_HEAD,
} from "@/apps/web-admin/common/constants/list-typography.constant";
import { cn } from "@/apps/web-admin/common/utils/classname.util";
import type { QnaItemResponseDto } from "@/apps/web-admin/features/qna/types/qna.dto";

interface QnaTableProps {
  items: QnaItemResponseDto[];
  isBusy: boolean;
  onEdit: (item: QnaItemResponseDto) => void;
  onDelete: (id: string) => void;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function QnaTable({ items, isBusy, onEdit, onDelete }: QnaTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px]">
        <thead>
          <tr className="border-b border-border text-left">
            <th className={cn("px-4 py-3 text-left", LIST_TABLE_HEAD)}>카테고리</th>
            <th className={cn("px-4 py-3 text-left", LIST_TABLE_HEAD)}>질문</th>
            <th className={cn("px-4 py-3 text-left", LIST_TABLE_HEAD)}>상태</th>
            <th className={cn("px-4 py-3 text-left", LIST_TABLE_HEAD)}>등록일</th>
            <th className={cn("px-4 py-3 text-right", LIST_TABLE_HEAD)}>관리</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-border/80 last:border-0">
              <td className={cn("px-4 py-3 whitespace-nowrap", LIST_TABLE_CELL_MUTED)}>
                {item.category || "—"}
              </td>
              <td className={cn("px-4 py-3 max-w-[280px]", LIST_TABLE_CELL)}>
                <div className="flex items-center gap-1.5">
                  {item.isPinned && (
                    <Pin className="h-3.5 w-3.5 shrink-0 text-amber-500" aria-label="핀 고정" />
                  )}
                  <span className="truncate">Q. {item.question}</span>
                </div>
              </td>
              <td className={cn("px-4 py-3", LIST_TABLE_CELL)}>
                <StatusBadge variant={item.isActive ? "success" : "default"}>
                  {item.isActive ? "노출 중" : "비활성"}
                </StatusBadge>
              </td>
              <td className={cn("px-4 py-3 whitespace-nowrap", LIST_TABLE_CELL_MUTED)}>
                {formatDate(item.createdAt)}
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
