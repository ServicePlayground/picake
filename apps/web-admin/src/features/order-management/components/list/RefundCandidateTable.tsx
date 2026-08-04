import { BaseButton as Button } from "@/apps/web-admin/common/components/buttons/BaseButton";
import { StatusBadge } from "@/apps/web-admin/common/components/badges/StatusBadge";
import {
  LIST_TABLE_CELL,
  LIST_TABLE_CELL_MUTED,
  LIST_TABLE_HEAD,
} from "@/apps/web-admin/common/constants/list-typography.constant";
import { cn } from "@/apps/web-admin/common/utils/classname.util";
import type { AdminOrderResponseDto } from "@/apps/web-admin/features/order-management/types/order-management.dto";
import {
  formatOrderDateTime,
  getCancelOriginLabel,
} from "@/apps/web-admin/features/order-management/utils/order-management.ui.util";

interface RefundCandidateTableProps {
  items: AdminOrderResponseDto[];
  onRevert: (item: AdminOrderResponseDto) => void;
  isBusy: boolean;
}

export function RefundCandidateTable({ items, onRevert, isBusy }: RefundCandidateTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1040px]">
        <thead>
          <tr className="border-b border-border text-left">
            <th className={cn("px-4 py-3 text-left", LIST_TABLE_HEAD)}>주문번호</th>
            <th className={cn("px-4 py-3 text-left", LIST_TABLE_HEAD)}>스토어 / 상품</th>
            <th className={cn("px-4 py-3 text-left", LIST_TABLE_HEAD)}>취소 경위</th>
            <th className={cn("px-4 py-3 text-left", LIST_TABLE_HEAD)}>입금자명</th>
            <th className={cn("px-4 py-3 text-left", LIST_TABLE_HEAD)}>예약자 연락처</th>
            <th className={cn("px-4 py-3 text-right", LIST_TABLE_HEAD)}>결제 금액</th>
            <th className={cn("px-4 py-3 text-left", LIST_TABLE_HEAD)}>주문일시</th>
            <th className={cn("px-4 py-3 text-left", LIST_TABLE_HEAD)}>관리</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const origin = getCancelOriginLabel(item);
            const isReverted = Boolean(item.adminRefundRevertedAt);
            return (
              <tr key={item.id} className="border-b border-border/80 last:border-0">
                <td className={cn("px-4 py-3 font-mono text-xs", LIST_TABLE_CELL)}>
                  {item.orderNumber}
                </td>
                <td className={cn("px-4 py-3", LIST_TABLE_CELL)}>
                  <div className="font-medium">{item.storeName}</div>
                  <div className="text-xs text-muted-foreground">{item.productName}</div>
                </td>
                <td className={cn("px-4 py-3", LIST_TABLE_CELL)}>
                  <StatusBadge variant={origin.variant}>{origin.label}</StatusBadge>
                  {item.paymentPendingExpiredAt && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {formatOrderDateTime(item.paymentPendingExpiredAt)}
                    </div>
                  )}
                </td>
                {/* 입금자명이 있으면 손님이 "입금했다"고 신고한 주문 — 통장 대조 1순위 */}
                <td className={cn("px-4 py-3", LIST_TABLE_CELL)}>
                  {item.depositorName ? (
                    <span className="font-medium text-foreground">{item.depositorName}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className={cn("px-4 py-3", LIST_TABLE_CELL_MUTED)}>
                  <div>{item.reservationContactName ?? "—"}</div>
                  <div className="text-xs">{item.reservationPhone ?? "—"}</div>
                </td>
                <td className={cn("px-4 py-3 text-right tabular-nums", LIST_TABLE_CELL)}>
                  {item.totalPrice.toLocaleString()}원
                </td>
                <td className={cn("px-4 py-3 whitespace-nowrap", LIST_TABLE_CELL_MUTED)}>
                  {formatOrderDateTime(item.createdAt)}
                </td>
                <td className={cn("px-4 py-3", LIST_TABLE_CELL)}>
                  {isReverted ? (
                    <span className="text-xs text-muted-foreground">
                      되돌림 · {formatOrderDateTime(item.adminRefundRevertedAt)}
                    </span>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isBusy}
                      onClick={() => onRevert(item)}
                    >
                      환불 처리로 되돌리기
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
