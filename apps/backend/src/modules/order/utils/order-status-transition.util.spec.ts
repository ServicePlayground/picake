import { describe, expect, it } from "vitest";

import { OrderStatus } from "@apps/backend/modules/order/constants/order.constants";

import {
  isAdminRevertToRefundPendingAllowed,
  isSellerSettableOrderStatus,
  isSellerTransitionAllowed,
} from "./order-status-transition.util";

describe("isSellerSettableOrderStatus", () => {
  it("판매자가 설정 가능한 상태는 true를 반환한다", () => {
    expect(isSellerSettableOrderStatus(OrderStatus.CONFIRMED)).toBe(true);
  });

  it("판매자가 설정할 수 없는 상태(예: 예약신청)는 false를 반환한다", () => {
    expect(isSellerSettableOrderStatus(OrderStatus.RESERVATION_REQUESTED)).toBe(false);
  });
});

describe("isSellerTransitionAllowed", () => {
  it("입금대기는 예약신청에서만 판매자가 설정할 수 있다", () => {
    expect(
      isSellerTransitionAllowed(OrderStatus.RESERVATION_REQUESTED, OrderStatus.PAYMENT_PENDING),
    ).toBe(true);
    expect(
      isSellerTransitionAllowed(OrderStatus.PAYMENT_COMPLETED, OrderStatus.PAYMENT_PENDING),
    ).toBe(false);
  });

  it("예약확정은 입금대기 또는 입금완료 상태에서만 허용된다", () => {
    expect(isSellerTransitionAllowed(OrderStatus.PAYMENT_PENDING, OrderStatus.CONFIRMED)).toBe(
      true,
    );
    expect(isSellerTransitionAllowed(OrderStatus.PAYMENT_COMPLETED, OrderStatus.CONFIRMED)).toBe(
      true,
    );
    expect(
      isSellerTransitionAllowed(OrderStatus.RESERVATION_REQUESTED, OrderStatus.CONFIRMED),
    ).toBe(false);
  });

  it("픽업완료는 예약확정 또는 픽업대기 상태에서만 허용된다", () => {
    expect(isSellerTransitionAllowed(OrderStatus.CONFIRMED, OrderStatus.PICKUP_COMPLETED)).toBe(
      true,
    );
    expect(
      isSellerTransitionAllowed(OrderStatus.PICKUP_PENDING, OrderStatus.PICKUP_COMPLETED),
    ).toBe(true);
    expect(
      isSellerTransitionAllowed(OrderStatus.PAYMENT_PENDING, OrderStatus.PICKUP_COMPLETED),
    ).toBe(false);
  });

  it("노쇼는 픽업대기 상태에서만 허용된다", () => {
    expect(isSellerTransitionAllowed(OrderStatus.PICKUP_PENDING, OrderStatus.NO_SHOW)).toBe(true);
    expect(isSellerTransitionAllowed(OrderStatus.CONFIRMED, OrderStatus.NO_SHOW)).toBe(false);
  });

  it("취소완료는 예약신청 또는 입금대기 상태에서만 허용된다(입금 후에는 취소환불대기로 가야 함)", () => {
    expect(
      isSellerTransitionAllowed(OrderStatus.RESERVATION_REQUESTED, OrderStatus.CANCEL_COMPLETED),
    ).toBe(true);
    expect(
      isSellerTransitionAllowed(OrderStatus.PAYMENT_PENDING, OrderStatus.CANCEL_COMPLETED),
    ).toBe(true);
    expect(
      isSellerTransitionAllowed(OrderStatus.PAYMENT_COMPLETED, OrderStatus.CANCEL_COMPLETED),
    ).toBe(false);
  });

  it("취소환불대기는 입금완료 이후 상태(입금완료·예약확정·픽업대기)에서만 허용된다", () => {
    for (const from of [
      OrderStatus.PAYMENT_COMPLETED,
      OrderStatus.CONFIRMED,
      OrderStatus.PICKUP_PENDING,
    ]) {
      expect(isSellerTransitionAllowed(from, OrderStatus.CANCEL_REFUND_PENDING)).toBe(true);
    }
    expect(
      isSellerTransitionAllowed(OrderStatus.PAYMENT_PENDING, OrderStatus.CANCEL_REFUND_PENDING),
    ).toBe(false);
  });

  it("취소환불완료는 취소환불대기 상태에서만 허용된다", () => {
    expect(
      isSellerTransitionAllowed(
        OrderStatus.CANCEL_REFUND_PENDING,
        OrderStatus.CANCEL_REFUND_COMPLETED,
      ),
    ).toBe(true);
    expect(
      isSellerTransitionAllowed(OrderStatus.CONFIRMED, OrderStatus.CANCEL_REFUND_COMPLETED),
    ).toBe(false);
  });

  it("판매자가 설정할 수 없는 목표 상태(예: 픽업대기)는 어떤 출발 상태에서도 항상 false", () => {
    expect(isSellerTransitionAllowed(OrderStatus.CONFIRMED, OrderStatus.PICKUP_PENDING)).toBe(
      false,
    );
  });
});

describe("isAdminRevertToRefundPendingAllowed", () => {
  it("취소완료 상태에서만 관리자가 취소환불대기로 되돌릴 수 있다", () => {
    expect(isAdminRevertToRefundPendingAllowed(OrderStatus.CANCEL_COMPLETED)).toBe(true);
  });

  it("취소완료가 아닌 상태는 되돌릴 수 없다", () => {
    expect(isAdminRevertToRefundPendingAllowed(OrderStatus.CANCEL_REFUND_COMPLETED)).toBe(false);
    expect(isAdminRevertToRefundPendingAllowed(OrderStatus.CONFIRMED)).toBe(false);
  });
});
