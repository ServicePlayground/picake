import type { StatusBadgeVariant } from "@/apps/web-admin/common/components/badges/StatusBadge";
import type { AdminOrderResponseDto } from "@/apps/web-admin/features/order-management/types/order-management.dto";

/** ISO 날짜 문자열을 한국 로케일 표시용으로 포맷 (값 없으면 `-`) */
export function formatOrderDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * 취소완료 주문이 "어떻게" 취소됐는지 판정합니다.
 *
 * 주문 레코드에는 취소 종류를 담는 단일 필드가 없어, 남은 흔적으로 구분합니다.
 * - `paymentPendingExpiredAt` → 기한 만료 자동 취소 (아무도 의도하지 않음 = 실입금 가능성 최상)
 * - `sellerCancelReason` → 판매자 취소 (판매자가 입금 확인 전이었을 수 있음)
 * - `userCancelReason` → 손님 직접 취소
 */
export function getCancelOriginLabel(order: AdminOrderResponseDto): {
  label: string;
  variant: StatusBadgeVariant;
} {
  if (order.paymentPendingExpiredAt) {
    return { label: "기한 만료 자동 취소", variant: "error" };
  }
  if (order.sellerCancelReason) {
    return { label: "판매자 취소", variant: "warning" };
  }
  if (order.userCancelReason) {
    return { label: "손님 취소", variant: "default" };
  }
  return { label: "취소완료", variant: "default" };
}
