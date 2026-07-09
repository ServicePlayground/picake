import { formatBankLabel } from "@apps/backend/common/utils/bank-label.util";
import { OrderStatus } from "@apps/backend/modules/order/constants/order.constants";
import type { OrderStatusTransitionPayload } from "@apps/backend/modules/order/types/order-lifecycle.types";
import { USER_ORDER_ALIMTALK_TEMPLATE_IDS } from "@apps/backend/modules/notification/constants/user-order-alimtalk.constants";
import { buildUserOrderAlimtalkLinkVariables } from "@apps/backend/modules/notification/utils/user-order-alimtalk-link.util";
import {
  isPaymentExpiredCancelSource,
  isReservationRequestedOnCreate,
  isSellerStatusUpdate,
} from "@apps/backend/modules/notification/utils/user-order-notification-transition.util";

export interface UserOrderAlimtalkPayload {
  templateId: string;
  /** 템플릿 치환 변수 (키는 `#{변수명}` 형식, 등록된 템플릿과 정확히 일치해야 함) */
  variables: Record<string, string>;
}

/** 알림톡 변수 구성에 필요한 주문 정보 */
export interface UserOrderAlimtalkOrderInfo {
  /** 구매자 web-user 기본 URL (`PUBLIC_USER_DOMAIN`, `https://` 포함) */
  publicUserDomain: string;
  orderId: string;
  orderNumber: string;
  storeName: string | null;
  consumerName: string | null;
  productName: string | null;
  totalPrice: number;
  pickupDate: Date | null;
  pickupRoadAddress: string | null;
  pickupAddress: string | null;
  pickupDetailAddress: string | null;
  pickupLatitude: number | null;
  pickupLongitude: number | null;
  /** 입금 마감 시각 (입금대기 템플릿의 `#{입금마감}`) */
  paymentPendingDeadlineAt: Date | null;
  storeBankName: string | null;
  storeBankAccountNumber: string | null;
  storeAccountHolderName: string | null;
  /** 판매자 취소 사유 (취소완료-판매자 템플릿의 `#{취소사유}`) */
  sellerCancelReason: string | null;
  /** 판매자 취소환불대기 사유 (취소환불대기 템플릿의 `#{취소사유}`) */
  sellerCancelRefundPendingReason: string | null;
}

/** 일시를 알림톡 표시용 문자열로 변환합니다. (예: 2026년 6월 28일 14:30) */
function formatDateTime(date: Date | null): string {
  if (!date) return "미정";
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/** 금액을 천 단위 콤마 + 원 형식으로 변환합니다. (예: 140000 → 140,000원) */
function formatPrice(price: number): string {
  return `${new Intl.NumberFormat("ko-KR").format(price)}원`;
}

/** 픽업 주소 문자열을 조합합니다. (도로명 우선, 상세주소 결합) */
function buildPickupAddress(order: UserOrderAlimtalkOrderInfo): string {
  const base = order.pickupRoadAddress || order.pickupAddress || "";
  return order.pickupDetailAddress ? `${base} ${order.pickupDetailAddress}`.trim() : base;
}

/**
 * 주문 상태 전환 → 구매자 알림톡 페이로드(템플릿 ID + 변수).
 *
 * - 템플릿 ID가 비어 있거나(미등록) 매핑이 없는 상태·케이스는 `null`을 반환해 발송을 건너뜁니다.
 * - WL 버튼 URL 형식·등록 가이드는 `USER_ORDER_ALIMTALK_BUTTON_URLS` 참고.
 * - 픽업대기 템플릿 길찾기는 `#{위도}`, `#{경도}`를 추가로 공급합니다.
 */
export function buildUserOrderAlimtalkPayload(
  payload: Pick<OrderStatusTransitionPayload, "fromStatus" | "toStatus" | "source">,
  order: UserOrderAlimtalkOrderInfo,
): UserOrderAlimtalkPayload | null {
  const linkVariables = buildUserOrderAlimtalkLinkVariables(order.publicUserDomain, order.orderId);
  if (!linkVariables) return null;

  const T = USER_ORDER_ALIMTALK_TEMPLATE_IDS;

  const 고객명 = order.consumerName ?? "고객";
  const 스토어명 = order.storeName ?? "";
  const 주문번호 = order.orderNumber;
  const 상품명 = order.productName ?? "";
  const 결제금액 = formatPrice(order.totalPrice);
  const 픽업일시 = formatDateTime(order.pickupDate);
  const 픽업주소 = buildPickupAddress(order);

  /** 모든 템플릿 공통 (본문 + WL 버튼 링크 변수) */
  const base: Record<string, string> = {
    ...linkVariables,
    "#{고객명}": 고객명,
    "#{스토어명}": 스토어명,
    "#{주문번호}": 주문번호,
    "#{상품명}": 상품명,
  };

  const emit = (
    templateId: string,
    variables: Record<string, string>,
  ): UserOrderAlimtalkPayload | null => (templateId ? { templateId, variables } : null);

  switch (payload.toStatus) {
    // 템플릿1 예약신청 (주문 직후)
    case OrderStatus.RESERVATION_REQUESTED: {
      if (!isReservationRequestedOnCreate(payload)) return null;
      return emit(T.RESERVATION_REQUESTED, {
        ...base,
        "#{결제금액}": 결제금액,
        "#{픽업일시}": 픽업일시,
        "#{픽업주소}": 픽업주소,
      });
    }

    // 템플릿2 입금대기 (판매자 예약 확인)
    case OrderStatus.PAYMENT_PENDING: {
      return emit(T.PAYMENT_PENDING, {
        ...base,
        "#{결제금액}": 결제금액,
        "#{입금마감}": formatDateTime(order.paymentPendingDeadlineAt),
        "#{은행명}": formatBankLabel(order.storeBankName),
        "#{계좌번호}": order.storeBankAccountNumber ?? "",
        "#{예금주}": order.storeAccountHolderName ?? "",
      });
    }

    // 템플릿3 예약확정 (판매자 확정)
    case OrderStatus.CONFIRMED: {
      return emit(T.CONFIRMED, {
        ...base,
        "#{결제금액}": 결제금액,
        "#{픽업일시}": 픽업일시,
        "#{픽업주소}": 픽업주소,
      });
    }

    // 템플릿4 픽업대기 (픽업 시각 자동 전환)
    case OrderStatus.PICKUP_PENDING: {
      return emit(T.PICKUP_PENDING, {
        ...base,
        "#{픽업일시}": 픽업일시,
        "#{픽업주소}": 픽업주소,
        "#{위도}": order.pickupLatitude != null ? String(order.pickupLatitude) : "",
        "#{경도}": order.pickupLongitude != null ? String(order.pickupLongitude) : "",
      });
    }

    // 템플릿5 픽업완료 (판매자 처리)
    case OrderStatus.PICKUP_COMPLETED: {
      return emit(T.PICKUP_COMPLETED, { ...base });
    }

    // 템플릿6·7 취소완료 (입금 마감 초과 자동 / 판매자 취소)
    case OrderStatus.CANCEL_COMPLETED: {
      if (isPaymentExpiredCancelSource(payload)) {
        return emit(T.CANCEL_COMPLETED_PAYMENT_EXPIRED, { ...base });
      }
      if (isSellerStatusUpdate(payload)) {
        return emit(T.CANCEL_COMPLETED_BY_SELLER, {
          ...base,
          "#{취소사유}": order.sellerCancelReason ?? "",
        });
      }
      // 사용자 직접 취소(입금 전)는 본인 액션이라 발송하지 않음
      return null;
    }

    // 템플릿8 취소환불대기 (판매자 환불 진행 — 사용자 요청은 본인 액션이라 발송하지 않음)
    case OrderStatus.CANCEL_REFUND_PENDING: {
      if (!isSellerStatusUpdate(payload)) return null;
      return emit(T.CANCEL_REFUND_PENDING_BY_SELLER, {
        ...base,
        "#{결제금액}": 결제금액,
        "#{픽업일시}": 픽업일시,
        "#{취소사유}": order.sellerCancelRefundPendingReason ?? "",
      });
    }

    // 템플릿9 취소환불완료 (판매자 환불 완료)
    case OrderStatus.CANCEL_REFUND_COMPLETED: {
      return emit(T.CANCEL_REFUND_COMPLETED, {
        ...base,
        "#{결제금액}": 결제금액,
      });
    }

    default:
      return null;
  }
}
