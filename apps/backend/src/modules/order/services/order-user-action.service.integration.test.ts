import { describe, expect, it, vi } from "vitest";

import { OrderStatus } from "@apps/backend/modules/order/constants/order.constants";
import { OrderAutomationService } from "@apps/backend/modules/order/services/order-automation.service";
import type { OrderLifecycleHookService } from "@apps/backend/modules/order/services/order-lifecycle-hook.service";
import { OrderUserActionService } from "@apps/backend/modules/order/services/order-user-action.service";
import type { NotificationOrderDispatchService } from "@apps/backend/modules/notification/services/notification-order-dispatch.service";
import { StoreBankName } from "@apps/backend/modules/store/constants/store.constants";
import { getTestPrisma } from "@apps/backend/test/integration/db";
import {
  createTestConsumer,
  createTestOrder,
  createTestProduct,
  createTestSeller,
  createTestStore,
} from "@apps/backend/test/integration/factories";

/**
 * 유닛테스트는 Prisma를 전부 mock 처리해서 "이 상태에서 어떤 예외를 던지는가" 같은
 * 순수 분기 로직만 검증합니다. 여기서는 실제 Postgres에 붙여서, 상태 전환 결과가
 * DB에 정확히 반영되는지(특히 환불 계좌 같은 여러 필드의 원자적 갱신)와,
 * 만료 자동취소처럼 동시에 여러 요청이 몰려도 딱 한 번만 처리되는지를 검증합니다.
 */
describe("주문 상태 전이 (취소/환불) (integration)", () => {
  function buildLifecycleHookMock() {
    return { afterOrderStatusTransition: vi.fn() } as unknown as OrderLifecycleHookService;
  }

  async function setupOrder(overrides: Parameters<typeof createTestOrder>[2] = {}) {
    const prisma = getTestPrisma();
    const seller = await createTestSeller(prisma);
    const store = await createTestStore(prisma, seller.id);
    const product = await createTestProduct(prisma, store.id);
    const consumer = await createTestConsumer(prisma);
    const order = await createTestOrder(
      prisma,
      { consumerId: consumer.id, productId: product.id, storeId: store.id },
      overrides,
    );
    return { prisma, order };
  }

  function buildUserActionService(lifecycleHook = buildLifecycleHookMock()) {
    const prisma = getTestPrisma();
    const notificationDispatch = {} as unknown as NotificationOrderDispatchService;
    const automation = new OrderAutomationService(prisma, lifecycleHook, notificationDispatch);
    const service = new OrderUserActionService(prisma, automation, lifecycleHook);
    return { service, lifecycleHook };
  }

  it("예약신청 단계에서 미입금 취소하면 취소완료로 전환되고 사유가 저장된다", async () => {
    const { prisma, order } = await setupOrder({ orderStatus: OrderStatus.RESERVATION_REQUESTED });
    const { service } = buildUserActionService();

    await service.cancelBeforePayment(order.id, order.consumerId, {
      reason: "일정이 변경됐어요",
      hasDeposited: false,
    });

    const saved = await prisma.order.findUniqueOrThrow({ where: { id: order.id } });
    expect(saved.orderStatus).toBe(OrderStatus.CANCEL_COMPLETED);
    expect(saved.userCancelReason).toBe("일정이 변경됐어요");
  });

  it("입금대기 단계에서 입금했다고 신고하며 취소하면 취소환불대기로 전환되고 환불계좌가 저장된다", async () => {
    const { prisma, order } = await setupOrder({ orderStatus: OrderStatus.PAYMENT_PENDING });
    const { service } = buildUserActionService();

    await service.cancelBeforePayment(order.id, order.consumerId, {
      reason: "이미 입금했어요",
      hasDeposited: true,
      bankName: StoreBankName.KB_KOOKMIN,
      bankAccountNumber: "110-302-1234567",
      accountHolderName: "홍길동",
    });

    const saved = await prisma.order.findUniqueOrThrow({ where: { id: order.id } });
    expect(saved.orderStatus).toBe(OrderStatus.CANCEL_REFUND_PENDING);
    expect(saved.refundBankName).toBe(StoreBankName.KB_KOOKMIN);
    expect(saved.refundBankAccountNumber).toBe("110-302-1234567");
    expect(saved.refundAccountHolderName).toBe("홍길동");
  });

  it("입금완료 이후 환불을 요청하면 취소환불대기로 전환된다", async () => {
    const { prisma, order } = await setupOrder({ orderStatus: OrderStatus.PAYMENT_COMPLETED });
    const { service } = buildUserActionService();

    await service.requestRefund(order.id, order.consumerId, {
      reason: "마음이 바뀌었어요",
      bankName: StoreBankName.TOSS_BANK,
      bankAccountNumber: "1000-1234-5678",
      accountHolderName: "김철수",
    });

    const saved = await prisma.order.findUniqueOrThrow({ where: { id: order.id } });
    expect(saved.orderStatus).toBe(OrderStatus.CANCEL_REFUND_PENDING);
    expect(saved.refundRequestReason).toBe("마음이 바뀌었어요");
  });

  it("입금 기한이 지난 주문에 동시에 여러 요청이 몰려도 자동취소는 정확히 한 번만 처리된다", async () => {
    const { prisma, order } = await setupOrder({
      orderStatus: OrderStatus.PAYMENT_PENDING,
      paymentPendingAt: new Date(Date.now() - 60 * 60 * 1000),
      paymentPendingDeadlineAt: new Date(Date.now() - 1000), // 이미 만료됨
    });
    const lifecycleHook = buildLifecycleHookMock();
    const notificationDispatch = {} as unknown as NotificationOrderDispatchService;
    const automation = new OrderAutomationService(prisma, lifecycleHook, notificationDispatch);

    // syncOrderLifecycleById는 사용자의 여러 액션(입금완료 처리, 취소, 환불 요청 등) 진입 시마다
    // 매번 호출된다. 만료된 같은 주문에 대해 동시에 여러 요청이 들어와도 updateMany의
    // orderStatus 가드(where) 덕분에 실제로는 딱 한 번만 전환·훅 호출이 일어나야 한다.
    await Promise.all(Array.from({ length: 5 }, () => automation.syncOrderLifecycleById(order.id)));

    const saved = await prisma.order.findUniqueOrThrow({ where: { id: order.id } });
    expect(saved.orderStatus).toBe(OrderStatus.CANCEL_COMPLETED);
    expect(lifecycleHook.afterOrderStatusTransition).toHaveBeenCalledTimes(1);
  });
});
