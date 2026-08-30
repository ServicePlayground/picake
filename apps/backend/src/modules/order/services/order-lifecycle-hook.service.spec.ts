import { Test } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { NotificationOrderDispatchService } from "@apps/backend/modules/notification/services/notification-order-dispatch.service";
import { OrderStatus } from "@apps/backend/modules/order/constants/order.constants";
import { ORDER_STATUS_TRANSITION_SOURCE } from "@apps/backend/modules/order/types/order-lifecycle.types";

import { OrderLifecycleHookService } from "./order-lifecycle-hook.service";

describe("OrderLifecycleHookService.afterOrderStatusTransition", () => {
  const notificationOrderDispatchServiceMock = {
    handleOrderStatusTransition: vi.fn().mockResolvedValue(undefined),
  };

  let service: OrderLifecycleHookService;

  beforeEach(async () => {
    vi.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        OrderLifecycleHookService,
        {
          provide: NotificationOrderDispatchService,
          useValue: notificationOrderDispatchServiceMock,
        },
      ],
    }).compile();

    service = moduleRef.get(OrderLifecycleHookService);
  });

  it("상태 전환 페이로드를 그대로 알림 디스패치 서비스에 전달한다", () => {
    const payload = {
      orderId: "order-1",
      fromStatus: OrderStatus.PAYMENT_PENDING,
      toStatus: OrderStatus.CONFIRMED,
      source: ORDER_STATUS_TRANSITION_SOURCE.SELLER_STATUS_UPDATE,
    };

    service.afterOrderStatusTransition(payload);

    expect(notificationOrderDispatchServiceMock.handleOrderStatusTransition).toHaveBeenCalledWith(
      payload,
    );
  });

  it("최초 생성(fromStatus가 null)인 경우에도 그대로 전달한다", () => {
    const payload = {
      orderId: "order-2",
      fromStatus: null,
      toStatus: OrderStatus.RESERVATION_REQUESTED,
      source: ORDER_STATUS_TRANSITION_SOURCE.ORDER_CREATE,
    };

    service.afterOrderStatusTransition(payload);

    expect(notificationOrderDispatchServiceMock.handleOrderStatusTransition).toHaveBeenCalledWith(
      payload,
    );
  });
});
