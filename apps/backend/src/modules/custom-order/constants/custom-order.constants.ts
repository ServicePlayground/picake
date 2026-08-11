export const CUSTOM_ORDER_ERROR_MESSAGES = {
  PRODUCT_NOT_FOUND: "상품을 찾을 수 없습니다.",
  PRODUCT_NOT_QUOTABLE: "상담 후 가격 결정 상품이 아닙니다.",
  PRODUCT_INACTIVE: "현재 주문할 수 없는 상품입니다.",
  REQUEST_NOT_FOUND: "커스텀 주문 요청을 찾을 수 없습니다.",
  REQUEST_NOT_OWNED: "해당 요청에 대한 권한이 없습니다.",
  INVALID_STATUS_FOR_QUOTE: "이미 견적이 제시되었거나 종료된 요청입니다.",
  INVALID_STATUS_FOR_DECISION: "견적을 받은 요청만 승인/거절할 수 있습니다.",
  PICKUP_OUTSIDE_BUSINESS_HOURS: "희망 픽업 일시가 매장 영업시간을 벗어납니다.",
  PICKUP_DATE_PASSED: "희망 픽업 일시가 지났습니다. 채팅으로 일정을 다시 조율해주세요.",
  PRODUCT_HAS_ACTIVE_REQUESTS:
    "진행 중인 커스텀 주문 요청이 있어 판매 방식을 변경하거나 삭제할 수 없습니다.",
  ALREADY_PROCESSED: "이미 처리된 요청입니다.",
} as const;

/** 채팅 타임라인에 표시되는 요청/견적 카드용 시스템 메시지 */
export const CUSTOM_ORDER_MESSAGES = {
  REQUEST_CREATED: "맞춤 주문 요청이 접수됐어요. 사장님이 확인 후 견적을 보내드릴게요.",
  QUOTE_SENT: "견적이 도착했어요. 확인 후 승인해주세요.",
  ACCEPTED: "주문이 확정됐어요. 입금 안내는 알림톡으로 보내드릴게요.",
  DECLINED: "견적이 거절되었어요. 채팅으로 다시 조율해보세요.",
} as const;

/** 진행 중으로 간주되는 상태 (상품 수정·삭제 가드) */
export const CUSTOM_ORDER_ACTIVE_STATUSES = ["REQUESTED", "QUOTED"] as const;
