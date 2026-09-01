/**
 * 관리자 API 키 인증에 사용하는 전용 헤더.
 * 사람 로그인 JWT(`Authorization: Bearer`)와 로그·가드 로직에서 섞이지 않도록 별도 헤더를 씁니다.
 */
export const ADMIN_API_KEY_HEADER = "x-admin-api-key";

/** 발급되는 키 원문 접두어 — 어떤 종류의 시크릿인지 값만 보고 구분하기 위함 (Stripe류 관행) */
export const ADMIN_API_KEY_PREFIX = "admk_";

/** 키 원문의 랜덤 바이트 길이 (base64url 인코딩 전) */
export const ADMIN_API_KEY_RANDOM_BYTES = 32;

/** 목록 화면에 원문 대신 노출할 접두어 길이 (`admk_` 포함) */
export const ADMIN_API_KEY_DISPLAY_PREFIX_LENGTH = 12;
