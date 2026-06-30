import { Icon } from "@/apps/web-user/common/components/icons";
import { getBankLabel } from "@/apps/web-user/common/utils/bank.util";
import { OrderResponse, OrderStatus } from "@/apps/web-user/features/order/types/order.type";
import { OrderDetailSectionTitle } from "./OrderDetailSectionTitle";
import { PaymentPendingActions } from "./PaymentPendingActions";

const UNPAID_STATUSES: OrderStatus[] = [
  OrderStatus.RESERVATION_REQUESTED,
  OrderStatus.PAYMENT_PENDING,
];

interface PaymentInfoSectionProps {
  order: OrderResponse;
}

export function PaymentInfoSection({ order }: PaymentInfoSectionProps) {
  const isUnpaid = UNPAID_STATUSES.includes(order.orderStatus);
  const isPaymentPending = order.orderStatus === OrderStatus.PAYMENT_PENDING;

  return (
    <section className="px-5">
      <OrderDetailSectionTitle>결제 정보</OrderDetailSectionTitle>
      <dl className="space-y-2">
        <div className="flex items-center gap-10">
          <dt className="w-[70px] text-sm text-gray-500 shrink-0">결제방식</dt>
          <dd className="text-sm text-gray-900">계좌이체</dd>
        </div>
        <div className="flex items-center gap-10">
          <dt className="w-[70px] text-sm text-gray-500 shrink-0">총 결제금액</dt>
          <dd className="flex items-center gap-1.5 text-sm text-gray-900">
            <span className="font-bold">{order.totalPrice.toLocaleString()}원</span>
            {isUnpaid && (
              <span className="text-2xs font-bold rounded px-1 py-0.5 text-gray-500 bg-gray-50">
                미결제
              </span>
            )}
          </dd>
        </div>

        {isPaymentPending && order.storeBankAccountNumber && (
          <div className="relative pt-4 after:content-[''] after:absolute after:top-1 after:left-0 after:w-full after:h-px after:bg-gray-50 space-y-2">
            <div className="flex items-center gap-10 ">
              <dt className="w-[70px] text-sm text-gray-500 shrink-0">계좌번호</dt>
              <dd className="flex-1 min-w-0 flex items-center gap-1 text-sm text-gray-900">
                <span className="truncate">
                  {getBankLabel(order.storeBankName)} {order.storeBankAccountNumber}
                </span>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(order.storeBankAccountNumber ?? "")}
                  className="text-gray-400 w-4 h-4 shrink-0"
                  aria-label="계좌번호 복사"
                >
                  <Icon name="copy" width={16} height={16} />
                </button>
              </dd>
            </div>
            <div className="flex items-center gap-10">
              <dt className="w-[70px] text-sm text-gray-500 shrink-0">은행</dt>
              <dd className="text-sm text-gray-900">{getBankLabel(order.storeBankName)}</dd>
            </div>
            <div className="flex items-center gap-10">
              <dt className="w-[70px] text-sm text-gray-500 shrink-0">예금주명</dt>
              <dd className="text-sm text-gray-900">{order.storeAccountHolderName}</dd>
            </div>
          </div>
        )}
      </dl>

      {isPaymentPending && <PaymentPendingActions order={order} />}
    </section>
  );
}
