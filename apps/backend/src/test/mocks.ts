import { vi } from "vitest";

import { NotificationOrderDispatchService } from "@apps/backend/modules/notification/services/notification-order-dispatch.service";

/**
 * NotificationOrderDispatchService의 전체 no-op mock.
 *
 * 이 서비스는 주문 상태 전환 훅과 OrderAutomationService(픽업/입금 리마인더 배치)에서
 * Firebase 푸시·카카오 알림톡을 실제로 발송한다. 통합/E2E 테스트에서 실제 발송을
 * 막기 위해 교체해야 하는데, 메서드 하나만 no-op으로 바꾸면 나머지 메서드가
 * 호출되는 시나리오(예: 리마인더 대상 주문이 존재하는 상태)에서 TypeError로 죽는다.
 * `.useValue(partial)`은 타입이 `any`라 tsc도 이 누락을 못 잡아준다.
 * 그래서 실제 인터페이스의 4개 public 메서드를 전부 갖춘 mock을 여기 한 곳에서만 관리한다.
 */
export function createNotificationOrderDispatchNoopMock(): NotificationOrderDispatchService {
  return {
    handleOrderStatusTransition: vi.fn().mockResolvedValue(undefined),
    handlePickupReminder: vi.fn().mockResolvedValue(undefined),
    handlePaymentReminder: vi.fn().mockResolvedValue(undefined),
    handlePaymentFinalReminder: vi.fn().mockResolvedValue(undefined),
  } as unknown as NotificationOrderDispatchService;
}
