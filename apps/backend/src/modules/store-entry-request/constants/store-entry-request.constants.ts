/**
 * 입점 요청 관련 에러 메시지
 */
export const STORE_ENTRY_REQUEST_ERROR_MESSAGES = {
  ALREADY_EXISTS: "이미 입점 요청한 가게입니다.",
} as const;

/**
 * 입점 요청 관련 성공 메시지
 */
export const STORE_ENTRY_REQUEST_SUCCESS_MESSAGES = {
  CREATED: "입점 요청이 접수되었습니다.",
} as const;

/**
 * 입점 요청 조회 시 공통으로 노출하는 필드
 */
export const STORE_ENTRY_REQUEST_SELECT = {
  id: true,
  kakaoPlaceId: true,
  placeName: true,
  address: true,
  roadAddress: true,
  phone: true,
  categoryName: true,
  placeUrl: true,
  latitude: true,
  longitude: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;
