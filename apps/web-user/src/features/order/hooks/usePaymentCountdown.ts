import { useEffect, useRef, useState } from "react";
import { OrderResponse } from "@/apps/web-user/features/order/types/order.type";

const FALLBACK_PAYMENT_DEADLINE_MS = 12 * 60 * 60 * 1000;

export function resolveDeadlineMs(order: OrderResponse): number | null {
  if (order.paymentPendingDeadlineAt) {
    return new Date(order.paymentPendingDeadlineAt).getTime();
  }
  if (order.paymentPendingAt) {
    return new Date(order.paymentPendingAt).getTime() + FALLBACK_PAYMENT_DEADLINE_MS;
  }
  return null;
}

/**
 * 입금대기 카운트다운
 * - 서버가 내려준 paymentPendingDeadlineAt 우선 사용
 * - 없으면 paymentPendingAt + 12시간으로 fallback
 */
export function usePaymentCountdown(order: OrderResponse) {
  const orderRef = useRef(order);
  orderRef.current = order;

  const getRemainingMs = () => {
    const deadline = resolveDeadlineMs(orderRef.current);
    if (deadline == null) return 0;
    return Math.max(0, deadline - Date.now());
  };

  const [remainingMs, setRemainingMs] = useState(getRemainingMs);

  useEffect(() => {
    setRemainingMs(getRemainingMs());
    const timer = setInterval(() => {
      const next = getRemainingMs();
      setRemainingMs(next);
      if (next <= 0) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [order.id, order.paymentPendingDeadlineAt, order.paymentPendingAt]);

  const h = String(Math.floor(remainingMs / 3600000)).padStart(2, "0");
  const m = String(Math.floor((remainingMs % 3600000) / 60000)).padStart(2, "0");
  const s = String(Math.floor((remainingMs % 60000) / 1000)).padStart(2, "0");

  return {
    text: `${h}:${m}:${s}`,
    isExpired: remainingMs <= 0,
  };
}
