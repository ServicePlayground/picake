/**
 * 애플리케이션 경로 상수 관리
 * - 모든 라우팅 경로를 중앙에서 관리
 * - 경로 변경 시 한 곳에서만 수정하면 됨
 */

export const PATHS = {
  // 메인 페이지
  HOME: "/",

  // 스토어 관련 경로
  STORE: {
    DETAIL: (storeId: string) => `/store/${storeId}`,
  },

  // 상품 관련 경로
  PRODUCT: {
    DETAIL: (productId: string) => `/product/${productId}`,
  },

  // 검색 관련 경로
  SEARCH: "/search",

  // 장바구니 관련 경로
  CART: "/cart",

  // 지도 페이지
  MAP: "/map",
  MAP_SEARCH: "/map/search",

  // 저장 페이지
  SAVED: "/saved",
  MY_SAVED: "/mypage/saved",

  // 주문 관련 경로
  ORDER: {
    DETAIL: (orderId: string) => `/order/${orderId}`,
    CANCEL: (orderId: string) => `/order/${orderId}/cancel`,
    CANCEL_REFUND: (orderId: string) => `/order/${orderId}/cancel/refund`,
    CANCEL_DETAIL: (orderId: string) => `/order/${orderId}/cancel-detail`,
  },

  // 마이페이지
  MYPAGE: "/mypage",
  MY_ORDERS: "/mypage/order",
  MY_REVIEWS: "/mypage/reviews",
  REVIEW_LIST: "/mypage/reviews/list",
  REVIEW_WRITE: (orderId: string) => `/mypage/reviews/write?orderId=${orderId}`,
  RECENT: "/mypage/recent",
  NOTICE: "/mypage/notice",
  QNA: "/mypage/qna",
  SETTING: "/mypage/setting",
  SETTING_ACCOUNT: "/mypage/setting/account",
  SETTING_NOTIFICATION: "/mypage/setting/notification",
  LEGAL_TERMS_OF_SERVICE: "/mypage/legal/terms-of-service",
  LEGAL_PRIVACY_POLICY: "/mypage/legal/privacy-policy",
  LEGAL_LOCATION_TERMS: "/mypage/legal/location-terms",
  LEGAL_THIRD_PARTY_CONSENT: "/mypage/legal/third-party-consent",
  VERSION: "/mypage/version",

  // 알람 페이지
  ALARM: "/alarm",

  // QA/테스트 전용 페이지
  QA: "/qa",

  AUTH: {
    GOOGLE_REDIRECT_URI: "/auth/login/google",
    GOOGLE_REGISTER: "/auth/register/google",
    KAKAO_REDIRECT_URI: "/auth/login/kakao",
    KAKAO_REGISTER: "/auth/register/kakao",
  },
} as const;
