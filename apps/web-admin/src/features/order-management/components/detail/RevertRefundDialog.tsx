import { useState } from "react";
import { BaseButton as Button } from "@/apps/web-admin/common/components/buttons/BaseButton";
import { BaseInput } from "@/apps/web-admin/common/components/inputs/BaseInput";
import { Label } from "@/apps/web-admin/common/components/labels/Label";
import { LIST_CARD_TITLE } from "@/apps/web-admin/common/constants/list-typography.constant";
import type { AdminOrderResponseDto } from "@/apps/web-admin/features/order-management/types/order-management.dto";
import {
  formatOrderDateTime,
  getCancelOriginLabel,
} from "@/apps/web-admin/features/order-management/utils/order-management.ui.util";

interface RevertRefundDialogProps {
  order: AdminOrderResponseDto | null;
  isBusy: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

/**
 * 취소완료 주문을 환불 처리로 되돌리기 전 확인 다이얼로그.
 *
 * 종착 상태를 예외적으로 되돌리는 조치라, 판단 근거(입금자명·취소 경위·연락처)를 함께 보여주고
 * 사유를 반드시 입력하게 합니다.
 */
export function RevertRefundDialog({ order, isBusy, onClose, onConfirm }: RevertRefundDialogProps) {
  const [reason, setReason] = useState("");

  if (!order) return null;

  const origin = getCancelOriginLabel(order);
  const canSubmit = reason.trim().length > 0 && !isBusy;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-lg border border-border bg-card text-card-foreground shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h3 className={LIST_CARD_TITLE}>환불 처리로 되돌리기</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            닫기
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto px-6 py-5">
          <div className="rounded-md border border-border bg-muted/40 p-4 text-sm">
            <div className="font-mono text-xs text-muted-foreground">{order.orderNumber}</div>
            <div className="mt-1 font-medium">{order.storeName}</div>
            <div className="text-muted-foreground">{order.productName}</div>
            <dl className="mt-3 grid grid-cols-[7rem_1fr] gap-y-1.5 text-xs">
              <dt className="text-muted-foreground">취소 경위</dt>
              <dd>
                {origin.label}
                {order.paymentPendingExpiredAt &&
                  ` · ${formatOrderDateTime(order.paymentPendingExpiredAt)}`}
              </dd>
              <dt className="text-muted-foreground">입금자명</dt>
              <dd className={order.depositorName ? "font-medium" : "text-muted-foreground"}>
                {order.depositorName ?? "없음"}
              </dd>
              <dt className="text-muted-foreground">예약자</dt>
              <dd>
                {order.reservationContactName ?? "—"} · {order.reservationPhone ?? "—"}
              </dd>
              <dt className="text-muted-foreground">결제 금액</dt>
              <dd className="tabular-nums">{order.totalPrice.toLocaleString()}원</dd>
            </dl>
          </div>

          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
            되돌리면 주문이 <b>취소환불대기</b>로 바뀌고 구매자·판매자에게 알림이 발송됩니다.
            <br />
            환불 계좌는 비어 있으며 <b>구매자가 직접 입력</b>합니다. 실제 환불 송금은 판매자가
            진행합니다.
          </div>

          <div className="space-y-1">
            <Label>되돌리는 사유 (필수)</Label>
            <BaseInput
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="예: 고객 입금 확인됨 - 통장 내역 대조 완료"
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground">
              감사 기록으로 남습니다. 무엇을 근거로 입금을 확인했는지 적어주세요.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
          <Button variant="outline" onClick={onClose} disabled={isBusy}>
            취소
          </Button>
          <Button onClick={() => onConfirm(reason.trim())} disabled={!canSubmit}>
            {isBusy ? "처리 중…" : "되돌리기"}
          </Button>
        </div>
      </div>
    </div>
  );
}
