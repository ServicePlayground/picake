import { BaseButton as Button } from "@/apps/web-admin/common/components/buttons/BaseButton";
import {
  LIST_TABLE_CELL,
  LIST_TABLE_CELL_MUTED,
  LIST_TABLE_HEAD,
} from "@/apps/web-admin/common/constants/list-typography.constant";
import { cn } from "@/apps/web-admin/common/utils/classname.util";
import type { SellerSegmentResponseDto } from "@/apps/web-admin/features/seller-segment-management/types/seller-segment-management.dto";

interface SellerSegmentTableProps {
  items: SellerSegmentResponseDto[];
  onAutoAssign: (item: SellerSegmentResponseDto) => void;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function SellerSegmentTable({ items, onAutoAssign }: SellerSegmentTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px]">
        <thead>
          <tr className="border-b border-border text-left">
            <th className={cn("px-4 py-3 text-left", LIST_TABLE_HEAD)}>이름 / 키</th>
            <th className={cn("px-4 py-3 text-left", LIST_TABLE_HEAD)}>소속 판매자</th>
            <th className={cn("px-4 py-3 text-left", LIST_TABLE_HEAD)}>등록일</th>
            <th className={cn("px-4 py-3 text-right", LIST_TABLE_HEAD)}>관리</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-border/80 last:border-0">
              <td className={cn("px-4 py-3 max-w-[260px]", LIST_TABLE_CELL)}>
                <div className="font-medium">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.key}</div>
              </td>
              <td className={cn("px-4 py-3", LIST_TABLE_CELL)}>
                {item.memberCount.toLocaleString()}명
              </td>
              <td className={cn("px-4 py-3 whitespace-nowrap", LIST_TABLE_CELL_MUTED)}>
                {formatDate(item.createdAt)}
              </td>
              <td className={cn("px-4 py-3", LIST_TABLE_CELL)}>
                <div className="flex justify-end">
                  <Button type="button" variant="outline" size="sm" onClick={() => onAutoAssign(item)}>
                    가입일 기준 자동 편입
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
