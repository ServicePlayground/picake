/**
 * 입점 요청 관련 에러 메시지
 */
export const STORE_ENTRY_REQUEST_ERROR_MESSAGES = {
  ALREADY_EXISTS: "이미 입점 요청한 가게입니다.",
  NOT_FOUND: "해당 입점 요청을 찾을 수 없습니다.",
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

/** 관리자 목록·상세용 (요청자 요약 포함) */
export const STORE_ENTRY_REQUEST_ADMIN_SELECT = {
  ...STORE_ENTRY_REQUEST_SELECT,
  consumer: {
    select: {
      id: true,
      phone: true,
      name: true,
      nickname: true,
    },
  },
} as const;
