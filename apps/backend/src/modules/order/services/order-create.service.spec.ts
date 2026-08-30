import { NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockDeep } from "vitest-mock-extended";

import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import { CreateOrderRequestDto } from "@apps/backend/modules/order/dto/order-create.dto";
import {
  ORDER_ERROR_MESSAGES,
  OrderStatus,
} from "@apps/backend/modules/order/constants/order.constants";
import { OrderLifecycleHookService } from "@apps/backend/modules/order/services/order-lifecycle-hook.service";
import { ORDER_STATUS_TRANSITION_SOURCE } from "@apps/backend/modules/order/types/order-lifecycle.types";
import { EnableStatus } from "@apps/backend/modules/product/constants/product.constants";

import { OrderCreateService } from "./order-create.service";

vi.mock("@apps/backend/modules/order/utils/order-store-business-calendar.util", () => ({
  isPickupAllowedForStore: vi.fn(() => true),
}));

import { isPickupAllowedForStore } from "@apps/backend/modules/order/utils/order-store-business-calendar.util";

const BASE_PRODUCT = {
  id: "product-1",
  storeId: "store-1",
  salePrice: 10000,
  salesStatus: EnableStatus.ENABLE,
  visibilityStatus: EnableStatus.ENABLE,
  cakeSizeOptions: [],
  cakeFlavorOptions: [],
  store: {
    weeklyClosedWeekdays: [],
    standardOpenTime: "00:00",
    standardCloseTime: "23:59",
    businessCalendarOverrides: null,
  },
};

function buildDto(overrides: Partial<CreateOrderRequestDto> = {}): CreateOrderRequestDto {
  return {
    productId: "product-1",
    productName: "테스트 케이크",
    productImages: [],
    items: [{ quantity: 1 }],
    totalQuantity: 1,
    totalPrice: 10000,
    storeName: "테스트 스토어",
    pickupDate: "2026-01-01T00:00:00.000Z",
    pickupAddress: "서울시 강남구",
    pickupRoadAddress: "서울시 강남구 테헤란로",
    pickupZonecode: "06000",
    pickupLatitude: 37.5,
    pickupLongitude: 127.0,
    ...overrides,
  } as CreateOrderRequestDto;
}

describe("OrderCreateService.createOrderForUser", () => {
  const prismaMock = mockDeep<PrismaService>();
  const orderLifecycleHookServiceMock = { afterOrderStatusTransition: vi.fn() };
  const txOrderMock = { count: vi.fn(), create: vi.fn() };

  let service: OrderCreateService;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.mocked(isPickupAllowedForStore).mockReturnValue(true);
    prismaMock.$transaction.mockImplementation((fn: any) => fn({ order: txOrderMock } as any));
    txOrderMock.count.mockResolvedValue(0);

    const moduleRef = await Test.createTestingModule({
      providers: [
        OrderCreateService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: OrderLifecycleHookService, useValue: orderLifecycleHookServiceMock },
      ],
    }).compile();

    service = moduleRef.get(OrderCreateService);
  });

  it("상품이 없으면 NotFoundException을 던진다", async () => {
    prismaMock.product.findUnique.mockResolvedValue(null);

    await expect(service.createOrderForUser("user-1", buildDto())).rejects.toThrow(
      new NotFoundException(ORDER_ERROR_MESSAGES.PRODUCT_NOT_FOUND),
    );
  });

  it("판매 비활성 상품이면 거부한다", async () => {
    prismaMock.product.findUnique.mockResolvedValue({
      ...BASE_PRODUCT,
      salesStatus: EnableStatus.DISABLE,
    } as any);

    await expect(service.createOrderForUser("user-1", buildDto())).rejects.toThrow(
      ORDER_ERROR_MESSAGES.PRODUCT_INACTIVE,
    );
  });

  it("비공개 상품이면 거부한다", async () => {
    prismaMock.product.findUnique.mockResolvedValue({
      ...BASE_PRODUCT,
      visibilityStatus: EnableStatus.DISABLE,
    } as any);

    await expect(service.createOrderForUser("user-1", buildDto())).rejects.toThrow(
      ORDER_ERROR_MESSAGES.PRODUCT_NOT_AVAILABLE,
    );
  });

  it("주문 항목이 비어있으면 거부한다", async () => {
    prismaMock.product.findUnique.mockResolvedValue(BASE_PRODUCT as any);

    await expect(service.createOrderForUser("user-1", buildDto({ items: [] }))).rejects.toThrow(
      ORDER_ERROR_MESSAGES.INVALID_ORDER_ITEMS,
    );
  });

  it("클라이언트가 보낸 총 수량이 서버 계산값과 다르면 거부한다 (변조 방지)", async () => {
    prismaMock.product.findUnique.mockResolvedValue(BASE_PRODUCT as any);

    await expect(
      service.createOrderForUser(
        "user-1",
        buildDto({ items: [{ quantity: 1 }] as any, totalQuantity: 5 }),
      ),
    ).rejects.toThrow(ORDER_ERROR_MESSAGES.INVALID_TOTAL_QUANTITY);
  });

  it("클라이언트가 보낸 총 금액이 서버 계산값(옵션가 포함)과 다르면 거부한다 (가격 변조 방지)", async () => {
    prismaMock.product.findUnique.mockResolvedValue(BASE_PRODUCT as any);

    await expect(
      service.createOrderForUser(
        "user-1",
        buildDto({ items: [{ quantity: 1 }] as any, totalQuantity: 1, totalPrice: 1 }),
      ),
    ).rejects.toThrow(ORDER_ERROR_MESSAGES.INVALID_TOTAL_PRICE);
  });

  it("사이즈/맛 옵션 가격이 총 금액 계산에 반영된다", async () => {
    prismaMock.product.findUnique.mockResolvedValue({
      ...BASE_PRODUCT,
      cakeSizeOptions: [{ id: "size-1", visible: "ENABLE", displayName: "1호", price: 3000 }],
      cakeFlavorOptions: [{ id: "flavor-1", visible: "ENABLE", displayName: "초코", price: 2000 }],
    } as any);
    txOrderMock.create.mockResolvedValue({ id: "order-1", orderItems: [] });

    // 기본가 10000 + 사이즈 3000 + 맛 2000 = 15000
    const result = await service.createOrderForUser(
      "user-1",
      buildDto({
        items: [{ quantity: 1, sizeId: "size-1", flavorId: "flavor-1" }] as any,
        totalQuantity: 1,
        totalPrice: 15000,
      }),
    );

    expect(result).toEqual({ id: "order-1" });
    expect(txOrderMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          orderItems: { create: [expect.objectContaining({ itemPrice: 15000 })] },
        }),
      }),
    );
  });

  it("픽업 일시가 스토어 영업 시간 밖이면 거부한다", async () => {
    prismaMock.product.findUnique.mockResolvedValue(BASE_PRODUCT as any);
    vi.mocked(isPickupAllowedForStore).mockReturnValue(false);

    await expect(service.createOrderForUser("user-1", buildDto())).rejects.toThrow(
      ORDER_ERROR_MESSAGES.PICKUP_OUTSIDE_STORE_BUSINESS_HOURS,
    );
  });

  it("정상 생성 시 예약신청 상태로 생성하고 라이프사이클 훅을 호출한다", async () => {
    prismaMock.product.findUnique.mockResolvedValue(BASE_PRODUCT as any);
    txOrderMock.create.mockResolvedValue({ id: "order-1", orderItems: [] });

    const result = await service.createOrderForUser("user-1", buildDto());

    expect(result).toEqual({ id: "order-1" });
    expect(txOrderMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ orderStatus: OrderStatus.RESERVATION_REQUESTED }),
      }),
    );
    expect(orderLifecycleHookServiceMock.afterOrderStatusTransition).toHaveBeenCalledWith({
      orderId: "order-1",
      fromStatus: null,
      toStatus: OrderStatus.RESERVATION_REQUESTED,
      source: ORDER_STATUS_TRANSITION_SOURCE.ORDER_CREATE,
    });
  });

  it("주문번호 중복(P2002)이면 재시도해서 성공한다", async () => {
    prismaMock.product.findUnique.mockResolvedValue(BASE_PRODUCT as any);
    const duplicateError = { code: "P2002", meta: { target: ["order_number"] } };
    txOrderMock.create
      .mockRejectedValueOnce(duplicateError)
      .mockResolvedValueOnce({ id: "order-1", orderItems: [] });

    const result = await service.createOrderForUser("user-1", buildDto());

    expect(result).toEqual({ id: "order-1" });
    expect(txOrderMock.create).toHaveBeenCalledTimes(2);
  });

  it("주문번호 중복이 최대 재시도 횟수를 넘으면 실패로 종료한다", async () => {
    prismaMock.product.findUnique.mockResolvedValue(BASE_PRODUCT as any);
    const duplicateError = { code: "P2002", meta: { target: ["order_number"] } };
    txOrderMock.create.mockRejectedValue(duplicateError);

    await expect(service.createOrderForUser("user-1", buildDto())).rejects.toThrow(
      ORDER_ERROR_MESSAGES.ORDER_CREATE_FAILED,
    );
  });

  it("주문번호 중복이 아닌 다른 DB 에러는 재시도 없이 그대로 던진다", async () => {
    prismaMock.product.findUnique.mockResolvedValue(BASE_PRODUCT as any);
    const otherError = new Error("connection lost");
    txOrderMock.create.mockRejectedValue(otherError);

    await expect(service.createOrderForUser("user-1", buildDto())).rejects.toThrow(
      "connection lost",
    );
    expect(txOrderMock.create).toHaveBeenCalledTimes(1);
  });
});
