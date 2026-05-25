import { useMemo } from "react";
import { BaseButton as Button } from "@/apps/web-admin/common/components/buttons/BaseButton";
import { StatusBadge } from "@/apps/web-admin/common/components/badges/StatusBadge";
import {
  LIST_TABLE_CELL,
  LIST_TABLE_CELL_MUTED,
  LIST_TABLE_HEAD,
} from "@/apps/web-admin/common/constants/list-typography.constant";
import { cn } from "@/apps/web-admin/common/utils/classname.util";
import type { TermsDocumentSummaryResponseDto } from "@/apps/web-admin/features/terms/types/terms.dto";
import {
  formatTermsDate,
  formatTermsDateTime,
} from "@/apps/web-admin/features/terms/utils/terms-date.util";
import { sortTermsVersionsByVersionDesc } from "@/apps/web-admin/features/terms/utils/terms-version.util";

interface TermsVersionTableProps {
  items: TermsDocumentSummaryResponseDto[];
  isBusy: boolean;
  onPreview: (id: string) => void;
  onActivate: (id: string) => void;
}

export function TermsVersionTable({
  items,
  isBusy,
  onPreview,
  onActivate,
}: TermsVersionTableProps) {
  const sortedItems = useMemo(() => sortTermsVersionsByVersionDesc(items), [items]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left">
        <thead>
          <tr className="border-b border-border">
            <th className={cn(LIST_TABLE_HEAD, "px-4 py-3 w-24")}>버전</th>
            <th className={cn(LIST_TABLE_HEAD, "px-4 py-3")}>제목</th>
            <th className={cn(LIST_TABLE_HEAD, "px-4 py-3 w-32 whitespace-nowrap")}>시행일</th>
            <th className={cn(LIST_TABLE_HEAD, "px-4 py-3 w-44 whitespace-nowrap")}>등록일</th>
            <th className={cn(LIST_TABLE_HEAD, "px-4 py-3 w-24 text-center")}>상태</th>
            <th className={cn(LIST_TABLE_HEAD, "px-4 py-3 w-[168px] text-right")}>작업</th>
          </tr>
        </thead>
        <tbody>
          {sortedItems.map((item) => (
            <tr
              key={item.id}
              className={cn(
                "border-b border-border/80 last:border-0",
                item.isActive && "bg-primary/5",
              )}
            >
              <td className={cn(LIST_TABLE_CELL, "px-4 py-3 font-mono font-medium tabular-nums")}>
                v{item.version}
              </td>
              <td className={cn(LIST_TABLE_CELL, "px-4 py-3")}>{item.title}</td>
              <td className={cn(LIST_TABLE_CELL_MUTED, "px-4 py-3 whitespace-nowrap")}>
                {formatTermsDate(item.effectiveAt)}
              </td>
              <td className={cn(LIST_TABLE_CELL_MUTED, "px-4 py-3 whitespace-nowrap")}>
                {formatTermsDateTime(item.createdAt)}
              </td>
              <td className="px-4 py-3 text-center">
                <StatusBadge variant={item.isActive ? "success" : "default"}>
                  {item.isActive ? "활성" : "비활성"}
                </StatusBadge>
              </td>
              <td className="px-4 py-3">
                <div className="ml-auto grid w-[156px] grid-cols-2 gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 w-full px-2"
                    onClick={() => onPreview(item.id)}
                  >
                    미리보기
                  </Button>
                  {item.isActive ? (
                    <span className="h-8" aria-hidden />
                  ) : (
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      className="h-8 w-full px-2"
                      disabled={isBusy}
                      onClick={() => onActivate(item.id)}
                    >
                      활성화
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
