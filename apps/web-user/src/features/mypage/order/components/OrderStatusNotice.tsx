import { OrderResponse, OrderStatus } from "@/apps/web-user/features/order/types/order.type";
import { PaymentPendingInfo } from "./PaymentPendingInfo";
import { InfoNotice } from "@/apps/web-user/common/components/notice/InfoNotice";

interface OrderStatusNoticeProps {
  order: OrderResponse;
}

/**
 * 주문 상태별 안내 메시지 컴포넌트
 * - PAYMENT_PENDING: 계좌 정보 및 입금 안내
 * - PAYMENT_COMPLETED: 판매자 입금 확인 대기 중
 * - CANCEL_REFUND_PENDING: 환불 처리 중
 * - CANCEL_COMPLETED: sellerCancelReason 있으면 판매자 취소, userCancelReason 있으면 구매자 취소, 둘 다 없으면 일반 취소
 * - NO_SHOW: 노쇼 처리
 * - 그 외 상태는 안내 없음 (null 반환)
 */
export function OrderStatusNotice({ order }: OrderStatusNoticeProps) {
  switch (order.orderStatus) {
    /* 입금대기: 계좌 정보 및 입금 안내 표시 */
    case OrderStatus.PAYMENT_PENDING:
      return <PaymentPendingInfo order={order} />;

    /* 입금완료: 판매자 확인 대기 중 안내 */
    case OrderStatus.PAYMENT_COMPLETED:
      return (
        <InfoNotice className="mt-1 mb-4" message="판매자의 입금 확인 후 예약이 확정됩니다." />
      );

    /* 환불대기: 환불 처리 중 안내 */
    case OrderStatus.CANCEL_REFUND_PENDING:
      return <InfoNotice className="mt-1 mb-4" message="환불 완료까지 1-2일 소요될 수 있습니다." />;

    /* 예약취소: sellerCancelReason 있을 때만 판매자 취소 안내 표시 (구매자 취소는 아무것도 표시하지 않음) */
    case OrderStatus.CANCEL_COMPLETED:
      if (!order.sellerCancelReason) return null;
      return (
        <InfoNotice
          className="mt-1 mb-4"
          message="판매자 요청으로 예약 취소되었습니다."
          description={order.sellerCancelReason}
        />
      );

    /* 노쇼: 노쇼 처리 안내 */
    case OrderStatus.NO_SHOW:
      return (
        <InfoNotice
          tone="red"
          className="mt-1 mb-4"
          message="노쇼 처리된 예약입니다."
          description={`${order.storeName}입니다. 노쇼로 인해 케이크는 폐기처리하였습니다.`}
        />
      );

    default:
      return null;
  }
}
