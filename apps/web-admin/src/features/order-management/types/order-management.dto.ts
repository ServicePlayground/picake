import type { PaginationMetaDto } from "@/apps/web-admin/common/types/api.dto";

/** 주문 상태 (백엔드 OrderStatus와 동일) */
export type OrderStatus =
  | "RESERVATION_REQUESTED"
  | "PAYMENT_PENDING"
  | "PAYMENT_COMPLETED"
  | "CONFIRMED"
  | "PICKUP_PENDING"
  | "PICKUP_COMPLETED"
  | "CANCEL_COMPLETED"
  | "CANCEL_REFUND_PENDING"
  | "CANCEL_REFUND_COMPLETED"
  | "NO_SHOW";

/**
 * 관리자 주문 응답. 백엔드 `OrderResponseDto` 중 환불 구제 판단에 필요한 필드만 정의합니다.
 */
export interface AdminOrderResponseDto {
  id: string;
  orderNumber: string;
  storeName: string;
  storePhoneNumber?: string | null;
  productName: string;
  totalPrice: number;
  orderStatus: OrderStatus;
  pickupDate: string;
  createdAt: string;

  /** 예약자 연락 정보 — 입금 여부 확인 시 연락할 대상 */
  reservationContactName?: string | null;
  reservationPhone?: string | null;

  /** 손님이 입금했다고 신고하며 입력한 이름. 통장 내역 대조 근거 */
  depositorName?: string | null;
  /** 입금 기한 만료로 자동 취소된 시각. 값이 있으면 의도한 취소가 아님 */
  paymentPendingExpiredAt?: string | null;

  /** 취소 사유들 — 어떤 경위로 취소됐는지 구분 */
  userCancelReason?: string | null;
  sellerCancelReason?: string | null;

  /** 환불 계좌 (되돌린 직후에는 비어 있고, 손님이 입력하면 채워짐) */
  refundBankName?: string | null;
  refundBankAccountNumber?: string | null;
  refundAccountHolderName?: string | null;

  /** 관리자 되돌리기 이력 */
  adminRefundRevertReason?: string | null;
  adminRefundRevertedAt?: string | null;
}

/** 환불 구제 대상 목록 조회 파라미터 */
export interface AdminRefundCandidateListQueryDto {
  page: number;
  limit: number;
  /** 입금 기한 만료로 자동 취소된 건만 */
  onlyPaymentExpired?: boolean;
  /** 이미 되돌린 건 제외 */
  excludeReverted?: boolean;
  orderNumber?: string;
  /** 통장에 찍힌 입금자명으로 주문 역추적 */
  depositorName?: string;
}

export interface AdminRefundCandidateListResponseDto {
  data: AdminOrderResponseDto[];
  meta: PaginationMetaDto;
}

/** 취소환불대기로 되돌리기 요청 */
export interface AdminRevertToRefundPendingRequestDto {
  reason: string;
}
