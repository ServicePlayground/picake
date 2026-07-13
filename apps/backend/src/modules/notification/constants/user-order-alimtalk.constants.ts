/**
 * 카카오 알림톡 템플릿 ID 매핑.
 *
 * ⚠️ 카카오 비즈메시지 센터(또는 SOLAPI 콘솔)에 템플릿을 등록·승인받은 뒤,
 *    발급된 실제 템플릿 ID로 교체해야 합니다. (빈 값이면 해당 상태는 발송되지 않음)
 *
 * 주문 흐름과 템플릿 대응:
 *  1. 예약신청(주문 직후)                → RESERVATION_REQUESTED
 *  2. 입금대기(판매자 예약 확인)          → PAYMENT_PENDING
 *  3. 예약확정(판매자 확정)               → CONFIRMED
 *  4. 픽업대기 안내(픽업 24시간 전)     → PICKUP_PENDING
 *  5. 픽업완료(판매자 처리)               → PICKUP_COMPLETED
 *  6. 취소완료(입금 마감 초과 자동)        → CANCEL_COMPLETED_PAYMENT_EXPIRED
 *  7. 취소완료(판매자 취소)               → CANCEL_COMPLETED_BY_SELLER
 *  8. 취소환불대기(판매자 환불 진행)       → CANCEL_REFUND_PENDING_BY_SELLER
 *  9. 취소환불완료(판매자 환불 완료)       → CANCEL_REFUND_COMPLETED
 */
export const USER_ORDER_ALIMTALK_TEMPLATE_IDS = {
  /** 템플릿1 예약신청: 주문 접수 안내 */
  RESERVATION_REQUESTED: "KA01TP260709143109474iuidaN5phmj",
  /** 템플릿2 입금대기: 계좌 입금 안내 */
  PAYMENT_PENDING: "KA01TP260709143633540gmoQcfz7sLJ",
  /** 템플릿3 예약확정 */
  CONFIRMED: "KA01TP260709145508054YJnDBsfzV72",
  /** 템플릿4 픽업대기: 픽업 24시간 전 안내 */
  PICKUP_PENDING: "KA01TP260711094419831qn71D4Ab3vt",
  /** 템플릿5 픽업완료: 후기 유도 */
  PICKUP_COMPLETED: "KA01TP260709145612824117yMbaVRy5",
  /** 템플릿6 취소완료: 입금 마감 초과 자동 취소 */
  CANCEL_COMPLETED_PAYMENT_EXPIRED: "KA01TP260709151109731V2jPPrbpFSy",
  /** 템플릿7 취소완료: 판매자(스토어) 취소 */
  CANCEL_COMPLETED_BY_SELLER: "KA01TP260709151146942Qy7LHpaqUCO",
  /** 템플릿8 취소환불대기: 판매자 환불 진행 안내 */
  CANCEL_REFUND_PENDING_BY_SELLER: "KA01TP260709152017983qyEZLcjRAe4",
  /** 템플릿9 취소환불완료 */
  CANCEL_REFUND_COMPLETED: "KA01TP260709152105867mWUzCUiR1E8",
} as const;

/**
 * 카카오 WL 버튼 URL 등록 형식 (`https://`는 템플릿에 고정, web-user `paths.constant.ts`와 경로 일치).
 *
 * 공통 변수 #{도메인} · #{주문ID}는 `buildUserOrderAlimtalkLinkVariables`가 채웁니다.
 * - #{도메인}: `PUBLIC_USER_DOMAIN` 호스트 (예: picakes.com, staging.picakes.com)
 * - #{주문ID}: 주문 CUID (예: clx7abc123...)
 */
export const USER_ORDER_ALIMTALK_BUTTON_URLS = {
  /** 템플릿1·3·4·6·7·8·9 [주문 상세보기] */
  ORDER_DETAIL: "https://#{도메인}/order/#{주문ID}",
  /** 템플릿2 [입금 완료하기] — 주문 상세에서 입금 완료 처리 */
  PAYMENT_COMPLETE: "https://#{도메인}/order/#{주문ID}",
  /** 템플릿4 [길찾기] — 카카오맵 길찾기 (픽업대기 템플릿의 #{위도}·#{경도}·#{스토어명} 사용) */
  MAP_DIRECTION: "https://map.kakao.com/link/map/#{스토어명},#{위도},#{경도}",
  /** 템플릿5 [후기 작성하기] */
  REVIEW_WRITE: "https://#{도메인}/mypage/reviews/write?orderId=#{주문ID}",
} as const;
