import { describe, expect, it } from "vitest";

import {
  computePaymentPendingDeadline,
  isPaymentFinalReminderDue,
  isPaymentFinalReminderEligible,
  isPaymentPendingExpired,
  isPaymentReminderDue,
  isPaymentReminderEligible,
  isPickupPendingDue,
  isPickupReminderDue,
  isPickupReminderLeadEligible,
  resolvePaymentPendingDeadline,
} from "./order-datetime.util";

const h = (hours: number) => hours * 60 * 60 * 1000;
const m = (minutes: number) => minutes * 60 * 1000;

describe("computePaymentPendingDeadline", () => {
  const t0 = new Date("2026-01-01T00:00:00.000Z");

  it("픽업일이 없으면 12시간 뒤를 마감으로 준다", () => {
    expect(computePaymentPendingDeadline(t0, null)).toEqual(new Date(t0.getTime() + h(12)));
  });

  it("픽업까지 12시간 초과로 남았으면 12시간 구간을 준다", () => {
    const pickup = new Date(t0.getTime() + h(13));
    expect(computePaymentPendingDeadline(t0, pickup)).toEqual(new Date(t0.getTime() + h(12)));
  });

  it("픽업까지 6시간 초과 12시간 이하로 남았으면 6시간 구간을 준다", () => {
    const pickup = new Date(t0.getTime() + h(9));
    expect(computePaymentPendingDeadline(t0, pickup)).toEqual(new Date(t0.getTime() + h(6)));
  });

  it("픽업까지 6시간 이하로 남았으면 1시간 구간을 준다", () => {
    const pickup = new Date(t0.getTime() + h(3));
    expect(computePaymentPendingDeadline(t0, pickup)).toEqual(new Date(t0.getTime() + h(1)));
  });

  it("계산된 구간이 픽업 시각을 넘으면 픽업 시각으로 캡핑한다", () => {
    // 픽업까지 30분만 남은 경우: 1시간 구간이지만 픽업 시각(30분 뒤)을 넘을 수 없다
    const pickup = new Date(t0.getTime() + m(30));
    expect(computePaymentPendingDeadline(t0, pickup)).toEqual(pickup);
  });
});

describe("resolvePaymentPendingDeadline / isPaymentPendingExpired", () => {
  const createdAt = new Date("2026-01-01T00:00:00.000Z");

  it("저장된 마감이 있으면 그대로 사용한다", () => {
    const deadline = new Date("2026-01-01T05:00:00.000Z");
    const resolved = resolvePaymentPendingDeadline({
      paymentPendingDeadlineAt: deadline,
      paymentPendingAt: null,
      createdAt,
      pickupDate: null,
    });
    expect(resolved).toEqual(deadline);
  });

  it("저장된 마감이 없으면 paymentPendingAt(없으면 createdAt) 기준으로 복원한다", () => {
    const resolved = resolvePaymentPendingDeadline({
      paymentPendingDeadlineAt: null,
      paymentPendingAt: null,
      createdAt,
      pickupDate: null,
    });
    expect(resolved).toEqual(new Date(createdAt.getTime() + h(12)));
  });

  it("마감 시각 이후는 만료, 이전은 만료 아님", () => {
    const input = {
      paymentPendingDeadlineAt: new Date(createdAt.getTime() + h(1)),
      paymentPendingAt: null,
      createdAt,
      pickupDate: null,
    };
    expect(isPaymentPendingExpired(new Date(createdAt.getTime() + h(1)), input)).toBe(true);
    expect(isPaymentPendingExpired(new Date(createdAt.getTime() + m(59)), input)).toBe(false);
  });
});

describe("isPickupPendingDue", () => {
  const pickupDate = new Date("2026-01-01T12:00:00.000Z");

  it("픽업 시각 도달 이후 true", () => {
    expect(isPickupPendingDue(pickupDate, pickupDate)).toBe(true);
    expect(isPickupPendingDue(pickupDate, new Date(pickupDate.getTime() + m(1)))).toBe(true);
  });

  it("픽업 시각 이전 false", () => {
    expect(isPickupPendingDue(pickupDate, new Date(pickupDate.getTime() - m(1)))).toBe(false);
  });
});

describe("isPickupReminderLeadEligible", () => {
  const createdAt = new Date("2026-01-01T00:00:00.000Z");

  it("생성~픽업 간격이 24시간 이상이면 true", () => {
    expect(isPickupReminderLeadEligible(createdAt, new Date(createdAt.getTime() + h(24)))).toBe(
      true,
    );
  });

  it("24시간 미만이면 false (당일·임박 예약은 전날 안내 생략)", () => {
    expect(isPickupReminderLeadEligible(createdAt, new Date(createdAt.getTime() + h(23)))).toBe(
      false,
    );
  });
});

describe("isPickupReminderDue", () => {
  const pickupDate = new Date("2026-01-02T00:00:00.000Z");

  it("픽업 24시간 전 시점부터 픽업 시각 직전까지 true", () => {
    expect(isPickupReminderDue(pickupDate, new Date(pickupDate.getTime() - h(24)))).toBe(true);
    expect(isPickupReminderDue(pickupDate, new Date(pickupDate.getTime() - h(1)))).toBe(true);
  });

  it("24시간보다 더 이르거나, 픽업 시각에 도달하면 false", () => {
    expect(isPickupReminderDue(pickupDate, new Date(pickupDate.getTime() - h(25)))).toBe(false);
    expect(isPickupReminderDue(pickupDate, pickupDate)).toBe(false);
  });
});

describe("isPaymentReminderEligible / isPaymentReminderDue (1차, 3시간 전)", () => {
  const paymentPendingAt = new Date("2026-01-01T00:00:00.000Z");

  it("입금 창구가 3시간 초과면 대상이다", () => {
    const deadline = new Date(paymentPendingAt.getTime() + h(4));
    expect(isPaymentReminderEligible(paymentPendingAt, deadline)).toBe(true);
  });

  it("입금 창구가 3시간 이하(픽업 임박)면 대상이 아니다", () => {
    const deadline = new Date(paymentPendingAt.getTime() + h(1));
    expect(isPaymentReminderEligible(paymentPendingAt, deadline)).toBe(false);
  });

  it("마감 3시간 전부터 마감 직전까지 발송 시점이다", () => {
    const deadline = new Date(paymentPendingAt.getTime() + h(5));
    expect(isPaymentReminderDue(deadline, new Date(deadline.getTime() - h(3)))).toBe(true);
    expect(isPaymentReminderDue(deadline, new Date(deadline.getTime() - h(4)))).toBe(false);
    expect(isPaymentReminderDue(deadline, deadline)).toBe(false);
  });
});

describe("isPaymentFinalReminderEligible / isPaymentFinalReminderDue (2차, 30분 전)", () => {
  const paymentPendingAt = new Date("2026-01-01T00:00:00.000Z");

  it("입금 창구가 30분 초과면 대상이다 (짧은 창구도 포함)", () => {
    const deadline = new Date(paymentPendingAt.getTime() + h(1));
    expect(isPaymentFinalReminderEligible(paymentPendingAt, deadline)).toBe(true);
  });

  it("입금 창구가 30분 이하면 대상이 아니다 (이미 지난 시점)", () => {
    const deadline = new Date(paymentPendingAt.getTime() + m(20));
    expect(isPaymentFinalReminderEligible(paymentPendingAt, deadline)).toBe(false);
  });

  it("마감 30분 전부터 마감 직전까지 발송 시점이다", () => {
    const deadline = new Date(paymentPendingAt.getTime() + h(2));
    expect(isPaymentFinalReminderDue(deadline, new Date(deadline.getTime() - m(30)))).toBe(true);
    expect(isPaymentFinalReminderDue(deadline, new Date(deadline.getTime() - m(31)))).toBe(false);
    expect(isPaymentFinalReminderDue(deadline, deadline)).toBe(false);
  });
});
