import { SWAGGER_EXAMPLES as PRODUCT_SWAGGER_EXAMPLES } from "@apps/backend/modules/product/constants/product.constants";
import { SWAGGER_EXAMPLES as STORE_SWAGGER_EXAMPLES } from "@apps/backend/modules/store/constants/store.constants";
import { SWAGGER_EXAMPLES as USER_SWAGGER_EXAMPLES } from "@apps/backend/modules/auth/constants/auth.constants";

/**
 * 주문 관련 에러 메시지
 */
export const ORDER_ERROR_MESSAGES = {
  NOT_FOUND: "주문을 찾을 수 없습니다.",
  FORBIDDEN: "해당 주문에 대한 권한이 없습니다.",
  PRODUCT_NOT_FOUND: "상품을 찾을 수 없습니다.",
  PRODUCT_INACTIVE: "판매중지된 상품입니다.",
  PRODUCT_NOT_AVAILABLE: "구매할 수 없는 상품입니다.",
  STORE_NOT_FOUND: "스토어를 찾을 수 없습니다.",
  STORE_NOT_OWNED: "해당 스토어에 대한 권한이 없습니다.",
  INVALID_ORDER_ITEMS: "주문 항목이 올바르지 않습니다.",
  INVALID_TOTAL_QUANTITY: "총 수량이 올바르지 않습니다.",
  INVALID_TOTAL_PRICE: "총 금액이 올바르지 않습니다.",
  INVALID_STATUS_TRANSITION: "현재 주문 상태에서 요청한 상태로 변경할 수 없습니다.",
  SAME_STATUS: "이미 해당 상태입니다.",
  PAYMENT_PENDING_EXPIRED: "입금 가능 시간이 지나 예약이 취소되었습니다.",
  INVALID_USER_ORDER_ACTION: "지금 이 주문에 대해 수행할 수 없는 작업입니다.",
  SELLER_CANCEL_REASON_REQUIRED: "예약 취소(취소완료) 시 취소 사유를 입력해 주세요.",
  SELLER_NO_SHOW_REASON_REQUIRED: "노쇼 처리 시 노쇼 사유를 입력해 주세요.",
  SELLER_CANCEL_REFUND_PENDING_REASON_REQUIRED: "취소환불대기로 변경할 때 사유를 입력해 주세요.",
  ORDER_CREATE_FAILED: "주문 생성에 실패했습니다. 잠시 후 다시 시도해주세요.",
  /** 픽업 일시가 스토어 영업 캘린더(정기 휴무·표준 시간·일별 예외)에 맞지 않음 */
  PICKUP_OUTSIDE_STORE_BUSINESS_HOURS: "선택한 픽업 일시가 스토어 영업 시간에 포함되지 않습니다.",
} as const;

/**
 * 주문 관련 성공 메시지 상수
 */
export const ORDER_SUCCESS_MESSAGES = {
  ORDER_CREATED: "주문이 성공적으로 생성되었습니다.",
} as const;

/**
 * 주문 상태 enum
 */
export enum OrderStatus {
  RESERVATION_REQUESTED = "RESERVATION_REQUESTED", // 예약신청
  PAYMENT_PENDING = "PAYMENT_PENDING", // 입금대기
  PAYMENT_COMPLETED = "PAYMENT_COMPLETED", // 입금완료
  CONFIRMED = "CONFIRMED", // 예약확정
  PICKUP_PENDING = "PICKUP_PENDING", // 픽업대기
  PICKUP_COMPLETED = "PICKUP_COMPLETED", // 픽업완료
  CANCEL_COMPLETED = "CANCEL_COMPLETED", // 취소완료
  CANCEL_REFUND_PENDING = "CANCEL_REFUND_PENDING", // 취소환불대기
  CANCEL_REFUND_COMPLETED = "CANCEL_REFUND_COMPLETED", // 취소환불완료
  NO_SHOW = "NO_SHOW", // 노쇼
}

/** 회원 탈퇴를 막는 진행 중 주문 상태 (종료·취소·환불완료·노쇼 제외) */
export const ORDER_STATUSES_BLOCKING_ACCOUNT_WITHDRAWAL: OrderStatus[] = [
  OrderStatus.RESERVATION_REQUESTED,
  OrderStatus.PAYMENT_PENDING,
  OrderStatus.PAYMENT_COMPLETED,
  OrderStatus.CONFIRMED,
  OrderStatus.PICKUP_PENDING,
  OrderStatus.CANCEL_REFUND_PENDING,
];

/**
 * 사용자 주문 화면에서 후기 관련 UI 분기용
 */
export enum OrderMyReviewUiStatus {
  /** 픽업 완료 전·취소 등 후기 작성/조회 UI 대상 아님 */
  NOT_AVAILABLE = "NOT_AVAILABLE",
  /** 픽업 완료·미작성·삭제로 재작성 불가 아님 → 후기 작성 가능 */
  WRITABLE = "WRITABLE",
  /** 주문에 연결된 후기 존재 → 작성 후기 보기 이동용 */
  WRITTEN = "WRITTEN",
  /** 연결 후기 삭제로 동일 주문 재작성 불가 */
  WITHDRAWN = "WITHDRAWN",
}

/**
 * 주문 정렬 타입 enum
 */
export enum OrderSortBy {
  LATEST = "LATEST", // 최신순
  OLDEST = "OLDEST", // 오래된순
  PRICE_DESC = "PRICE_DESC", // 금액 높은순
  PRICE_ASC = "PRICE_ASC", // 금액 낮은순
}

/**
 * 주문 타입 enum (픽업 예정/지난 예약)
 */
export enum OrderType {
  UPCOMING = "UPCOMING", // 픽업 예정
  PAST = "PAST", // 지난 예약
}

/**
 * Swagger 예시 데이터
 */
const ORDER_ITEM_EXAMPLE = {
  id: "QXZw02vBqVXNQ29c4w9n9ZdH",
  orderId: "QXZw02vBqVXNQ29c4w9n9ZdG", // 주문 ID (관계 필드)
  // 사이즈 옵션 정보
  sizeId: "size_abcd1234",
  sizeDisplayName: "도시락",
  sizeLengthCm: 8,
  sizeDescription: "1인용",
  sizePrice: 25000,
  // 맛 옵션 정보
  flavorId: "flavor_efgh5678",
  flavorDisplayName: "초콜릿",
  flavorPrice: 10000,
  // 기타 옵션
  letteringMessage: "생일 축하해",
  requestMessage: "케이크 박스에 리본 부탁드려요",
  quantity: 1,
  itemPrice: 85000, // 기본 가격(50000) + 사이즈(25000) + 맛(10000)
  imageUrls: [],
  createdAt: new Date("2024-01-15T12:00:00.000Z"),
  updatedAt: new Date("2024-01-15T12:00:00.000Z"),
} as const;

export const SWAGGER_EXAMPLES = {
  ORDER_DATA: {
    id: "QXZw02vBqVXNQ29c4w9n9ZdG",
    orderNumber: "ORD-20240101-001",
    userId: USER_SWAGGER_EXAMPLES.CONSUMER_DATA.id,
    productId: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.id,
    productName: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.name,
    productImages: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.images,
    storeId: STORE_SWAGGER_EXAMPLES.ID,
    storeName: STORE_SWAGGER_EXAMPLES.NAME,
    storePhoneNumber: STORE_SWAGGER_EXAMPLES.PHONE_NUMBER,
    storeKakaoChannelId: STORE_SWAGGER_EXAMPLES.KAKAO_CHANNEL_ID,
    storeInstagramId: STORE_SWAGGER_EXAMPLES.INSTAGRAM_ID,
    storeBankName: STORE_SWAGGER_EXAMPLES.BANK_NAME,
    storeBankAccountNumber: STORE_SWAGGER_EXAMPLES.BANK_ACCOUNT_NUMBER,
    storeAccountHolderName: STORE_SWAGGER_EXAMPLES.ACCOUNT_HOLDER_NAME,
    storeRefundCancellationPolicy: STORE_SWAGGER_EXAMPLES.REFUND_CANCELLATION_POLICY,
    totalQuantity: 2,
    totalPrice: 140000,
    pickupDate: new Date("2024-01-15T14:00:00.000Z"),
    pickupAddress: STORE_SWAGGER_EXAMPLES.ADDRESS,
    pickupRoadAddress: STORE_SWAGGER_EXAMPLES.ROAD_ADDRESS,
    pickupDetailAddress: STORE_SWAGGER_EXAMPLES.DETAIL_ADDRESS,
    pickupZonecode: STORE_SWAGGER_EXAMPLES.ZONECODE,
    pickupLatitude: STORE_SWAGGER_EXAMPLES.LATITUDE,
    pickupLongitude: STORE_SWAGGER_EXAMPLES.LONGITUDE,
    orderStatus: OrderStatus.RESERVATION_REQUESTED,
    paymentPendingAt: null as null,
    paymentPendingDeadlineAt: null as null,
    depositorName: null as null,
    reservationContactName: "김예약",
    reservationPhone: "01012345678",
    userCancelReason: null as null,
    sellerCancelReason: null as null,
    sellerNoShowReason: null as null,
    refundRequestReason: null as null,
    refundBankName: null as null,
    refundBankAccountNumber: null as null,
    refundAccountHolderName: null as null,
    sellerCancelRefundPendingReason: null as null,
    orderItems: [ORDER_ITEM_EXAMPLE],
    createdAt: new Date("2024-01-01T12:00:00.000Z"),
    updatedAt: new Date("2024-01-01T12:00:00.000Z"),
    myReviewUiStatus: OrderMyReviewUiStatus.NOT_AVAILABLE,
    linkedProductReviewId: null as null,
  },
  ORDER_ITEM: ORDER_ITEM_EXAMPLE,
} as const;
