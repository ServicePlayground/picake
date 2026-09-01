import { describe, expect, it, vi } from "vitest";

import { CreateOrderRequestDto } from "@apps/backend/modules/order/dto/order-create.dto";
import { OrderCreateService } from "@apps/backend/modules/order/services/order-create.service";
import type { OrderLifecycleHookService } from "@apps/backend/modules/order/services/order-lifecycle-hook.service";
import { getTestPrisma } from "@apps/backend/test/integration/db";
import {
  createTestConsumer,
  createTestProduct,
  createTestSeller,
  createTestStore,
} from "@apps/backend/test/integration/factories";

/**
 * 유닛테스트(order-create.service.spec.ts)는 Prisma를 전부 mock 처리해서
 * "재고/상태에 따라 어떤 예외를 던지는가" 같은 순수 로직만 검증합니다.
 * 여기서는 실제 Postgres에 붙여서, mock으로는 절대 못 잡는
 * "DB 제약과 트랜잭션이 실제로 우리가 기대한 대로 동작하는가"만 검증합니다.
 */
describe("OrderCreateService (integration)", () => {
  function buildDto(productId: string, overrides: Partial<CreateOrderRequestDto> = {}) {
    return {
      pickupDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      productId,
      productName: "테스트 케이크",
      productImages: [],
      totalQuantity: 1,
      totalPrice: 30000,
      storeName: "테스트 스토어",
      pickupAddress: "서울특별시 강남구 역삼동",
      pickupRoadAddress: "서울특별시 강남구 테헤란로 1",
      pickupZonecode: "06234",
      pickupLatitude: 37.5,
      pickupLongitude: 127.03,
      items: [{ quantity: 1 }],
      ...overrides,
    } as CreateOrderRequestDto;
  }

  async function setupProduct() {
    const prisma = getTestPrisma();
    const seller = await createTestSeller(prisma);
    const store = await createTestStore(prisma, seller.id);
    const product = await createTestProduct(prisma, store.id);
    const consumer = await createTestConsumer(prisma);
    return { prisma, product, consumer };
  }

  function buildService(prisma = getTestPrisma()) {
    const lifecycleHook = {
      afterOrderStatusTransition: vi.fn(),
    } as unknown as OrderLifecycleHookService;
    return new OrderCreateService(prisma, lifecycleHook);
  }

  it("주문을 생성하면 orderItems까지 실제 DB에 함께 저장된다", async () => {
    const { prisma, product, consumer } = await setupProduct();
    const service = buildService(prisma);

    const result = await service.createOrderForUser(consumer.id, buildDto(product.id));

    const saved = await prisma.order.findUnique({
      where: { id: result.id },
      include: { orderItems: true },
    });

    expect(saved).not.toBeNull();
    expect(saved?.orderNumber).toMatch(/^ORD-\d{8}-\d{3}$/);
    expect(saved?.orderItems).toHaveLength(1);
    expect(saved?.orderItems[0].itemPrice).toBe(30000);
  });

  it("같은 날짜에 동시에 여러 건이 들어와도 주문번호 unique 제약을 재시도로 통과해 전부 성공한다", async () => {
    const { prisma, product, consumer } = await setupProduct();
    const service = buildService(prisma);

    // order-create.service.ts는 주문번호를 "당일 주문 수 + 1"로 계산하고,
    // unique 제약(P2002) 충돌 시 재시도한다. 동시 요청에서 이 재시도가 실제로
    // 동작해 주문번호가 겹치지 않는지는 mock으로는 검증할 수 없다.
    const concurrentRequests = 5;
    const results = await Promise.all(
      Array.from({ length: concurrentRequests }, () =>
        service.createOrderForUser(consumer.id, buildDto(product.id)),
      ),
    );

    const orders = await prisma.order.findMany({
      where: { id: { in: results.map((r) => r.id) } },
    });

    const orderNumbers = orders.map((o) => o.orderNumber);
    expect(orderNumbers).toHaveLength(concurrentRequests);
    expect(new Set(orderNumbers).size).toBe(concurrentRequests);
  });
});
