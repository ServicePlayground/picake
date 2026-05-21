/** SMS 인증번호 입력 가능 시간(분) — `PhoneUtil.getExpirationTime`·`AuthPhoneService.sendVerificationCode`와 동일 */
export const PHONE_VERIFICATION_CODE_EXPIRY_MINUTES = 5;

/**
 * 인증 관련 에러 메시지 상수
 */
export const AUTH_ERROR_MESSAGES = {
  USER_ID_INVALID_FORMAT: "아이디는 4-20자의 영문, 숫자, 언더스코어만 사용할 수 있습니다.",
  PASSWORD_INVALID_FORMAT:
    "비밀번호는 8자 이상의 영문 대소문자, 숫자, 특수문자(@$!%*?&)를 포함해야 합니다.",
  PHONE_INVALID_FORMAT: "올바른 한국 휴대폰 번호 형식이 아닙니다. (예: 010-1234-5678)",
  PHONE_ALREADY_EXISTS: "이미 사용 중인 휴대폰 번호입니다.",
  PHONE_VERIFICATION_REQUIRED: "휴대폰 인증이 필요합니다.",
  PHONE_VERIFICATION_CODE_GENERATION_FAILED:
    "인증번호 생성에 실패했습니다. 잠시 후 다시 시도해주세요.",
  PHONE_VERIFICATION_FAILED: "인증번호가 올바르지 않습니다.",
  VERIFICATION_CODE_INVALID_FORMAT: "인증번호는 6자리 숫자여야 합니다.",
  ACCOUNT_NOT_FOUND_BY_PHONE: "해당 휴대폰 번호로 등록된 계정이 없습니다.",
  GOOGLE_REGISTER_FAILED: "구글 로그인 회원가입에 실패했습니다.",
  PROFILE_UPDATE_NO_FIELDS:
    "변경할 정보가 없습니다. name, nickname, profileImageUrl 중 하나 이상을 보내주세요.",
  USER_NOT_FOUND: "사용자를 찾을 수 없습니다.",
  PHONE_VERIFICATION_EXPIRED: "인증번호가 만료되었습니다.",
  PHONE_GOOGLE_ACCOUNT_EXISTS: "해당 휴대폰 번호로 이미 등록된 구글 계정이 있습니다.",
  GOOGLE_ID_ALREADY_EXISTS: "이미 사용 중인 구글 계정입니다.",
  GOOGLE_OAUTH_TOKEN_EXCHANGE_FAILED: "구글 OAuth 토큰 교환 실패",
  PHONE_KAKAO_ACCOUNT_EXISTS: "해당 휴대폰 번호로 이미 등록된 카카오 계정이 있습니다.",
  KAKAO_ID_ALREADY_EXISTS: "이미 사용 중인 카카오 계정입니다.",
  KAKAO_OAUTH_TOKEN_EXCHANGE_FAILED: "카카오 OAuth 토큰 교환 실패",
  THROTTLE_LIMIT_EXCEEDED: "ThrottlerException: Too Many Requests",
  USERNAME_ALREADY_EXISTS: "이미 사용 중인 아이디입니다.",
  TOTP_SETUP_REQUIRED: "먼저 TOTP 설정을 시작해주세요.",
  OTP_CODE_INVALID: "OTP 코드가 올바르지 않습니다.",
  /* --------------------------------- 토큰 관련 에러 메시지 (반드시 401으로 사용) (주의: 프론트호환성을 위해, 여기 외에 401 오류가 있으면 안됨) --------------------------------- */
  REFRESH_TOKEN_EXPIRED:
    "[REFRESH_TOKEN_INVALID] 리프레시 토큰이 만료되었습니다. 다시 로그인해주세요.",
  REFRESH_TOKEN_INVALID:
    "[REFRESH_TOKEN_INVALID] 리프레시 토큰이 유효하지 않습니다. 다시 로그인해주세요.",
  REFRESH_TOKEN_MISSING: "[REFRESH_TOKEN_INVALID] 리프레시 토큰이 없습니다. 다시 로그인해주세요.",
  REFRESH_TOKEN_WRONG_TYPE:
    "[REFRESH_TOKEN_INVALID] 리프레시 토큰의 타입이 올바르지 않습니다. 다시 로그인해주세요.",
  REFRESH_TOKEN_MISSING_REQUIRED_INFO:
    "[REFRESH_TOKEN_INVALID] 리프레시 토큰에 필수 정보가 누락되었습니다. 다시 로그인해주세요.",
  ACCESS_TOKEN_EXPIRED: "[ACCESS_TOKEN_INVALID] 액세스 토큰이 만료되었습니다.",
  ACCESS_TOKEN_INVALID: "[ACCESS_TOKEN_INVALID] 액세스 토큰이 유효하지 않습니다.",
  ACCESS_TOKEN_MISSING: "[ACCESS_TOKEN_INVALID] 액세스 토큰이 없습니다.",
  ACCESS_TOKEN_WRONG_TYPE: "[ACCESS_TOKEN_INVALID] 액세스 토큰의 타입이 올바르지 않습니다.",
  ACCESS_TOKEN_MISSING_REQUIRED_INFO:
    "[ACCESS_TOKEN_INVALID] 액세스 토큰에 필수 정보가 누락되었습니다. 다시 로그인해주세요.",
  ACCESS_TOKEN_ACCOUNT_NOT_FOUND: "[ACCESS_TOKEN_INVALID] 계정을 찾을 수 없습니다.",
  ACCESS_TOKEN_ACCOUNT_INACTIVE: "[ACCESS_TOKEN_INVALID] 비활성화된 계정입니다.",
  /* ------------------------------------------------------------------------------------------------------ */
  AUDIENCE_NOT_AUTHORIZED: "이 API에 사용할 수 있는 인증 토큰이 아닙니다.",
  JWT_TYPE_NOT_ALLOWED_FOR_ROUTE: "이 요청에 사용할 수 없는 토큰입니다.",
  WITHDRAW_BLOCKED_ACTIVE_ORDERS:
    "진행 중인 주문이 있어 회원 탈퇴할 수 없습니다. 주문을 완료하거나 취소한 뒤 다시 시도해 주세요.",
} as const;

/**
 * 인증 관련 성공 메시지 상수
 */
export const AUTH_SUCCESS_MESSAGES = {
  PHONE_VERIFICATION_SENT: "인증번호가 발송되었습니다.",
  PHONE_VERIFICATION_CONFIRMED: "인증번호가 확인되었습니다.",
  PHONE_CHANGED: "휴대폰 번호가 변경되었습니다.",
  ACCOUNT_WITHDRAWN: "회원 탈퇴가 완료되었습니다.",
  ACCESS_TOKEN_REFRESHED: "새로운 Access Token이 발급되었습니다.",
  LOGOUT_SUCCESS: "로그아웃이 완료되었습니다.",
  ADMIN_TOTP_ENABLED: "Google OTP 2단계 인증이 활성화되었습니다.",
} as const;

/**
 * JWT `aud` 클레임 값이자 API 경로 prefix (`/v1/consumer/...`, `/v1/seller/...`, `/v1/admin/...`).
 */
export const AUDIENCE = {
  CONSUMER: "consumer",
  SELLER: "seller",
  ADMIN: "admin",
} as const;
export type AudienceConst = (typeof AUDIENCE)[keyof typeof AUDIENCE];

/** 관리자 `Admin.password_hash` bcrypt cost — `AuthAdminService.register`·`prisma/seed` 동일 */
export const ADMIN_BCRYPT_SALT_ROUNDS = 12;

/** Google Authenticator 등 OTP 앱에 표시되는 발급자 이름 */
export const ADMIN_TOTP_ISSUER = "Picake Admin";

/**
 * 휴대폰 인증 목적 enum (종류)
 * DB `phone_verifications.purpose`에는 `{audience}:{purpose}` 형태로 저장합니다 (`PhoneUtil.composeStoredPhoneVerificationPurpose`).
 */
export enum PhoneVerificationPurpose {
  REGISTRATION = "registration",
  GOOGLE_REGISTRATION = "google_registration",
  KAKAO_REGISTRATION = "kakao_registration",
  PHONE_CHANGE = "phone_change",
  FIND_ACCOUNT = "find_account",
}

/**
 * 토큰 타입 상수
 */
export const TOKEN_TYPES = {
  ACCESS: "access",
  REFRESH: "refresh",
  TOTP_PENDING: "totp_pending",
  TOTP_SETUP_PENDING: "totp_setup_pending",
} as const;

/**
 * JWT 토큰 만료 시간 상수
 */
export const JWT_EXPIRATION = {
  ACCESS_TOKEN: "90d",
  REFRESH_TOKEN: "90d",
} as const;

/**
 * Swagger 예시 데이터
 * 실제 API 응답·DTO와 맞춥니다
 */
export const SWAGGER_EXAMPLES = {
  CONSUMER_DATA: {
    id: "clxxxxconsumer",
    phone: "010-1234-5678",
    name: "홍길동",
    nickname: "홍길동_4821",
    profileImageUrl: "https://lh3.googleusercontent.com/a/example",
    isPhoneVerified: true,
    isActive: true,
    googleId: "google123456789",
    googleEmail: "user@gmail.com",
    kakaoId: "1234567890",
    kakaoEmail: "user@kakao.com",
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    lastLoginAt: new Date("2024-01-01T00:00:00.000Z"),
  },
  SELLER_DATA: {
    id: "clxxxxseller",
    phone: "010-9876-5432",
    name: "김판매",
    nickname: "김판매_3159",
    profileImageUrl: "https://lh3.googleusercontent.com/a/example",
    isPhoneVerified: true,
    isActive: true,
    googleId: "google987654321",
    googleEmail: "seller@gmail.com",
    kakaoId: "9876543210",
    kakaoEmail: "seller@kakao.com",
    sellerVerificationStatus: "BUSINESS_VERIFIED" as const,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    lastLoginAt: new Date("2024-01-01T00:00:00.000Z"),
  },
  ADMIN_DATA: {
    id: "clxxxxadmin",
    username: "seed_admin",
    isTotpEnabled: false,
    isActive: true,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    lastLoginAt: new Date("2024-01-01T12:00:00.000Z"),
  },
  TOKEN_RESPONSE: {
    accessToken:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbHh4eHhjb25zdW1lciIsImF1ZCI6ImNvbnN1bWVyIiwidHlwZSI6ImFjY2VzcyIsImlhdCI6MTcwNDA2NzIwMCwiZXhwIjoxNzM1Njg5NjAwfQ.example_sig",
    refreshToken:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbHh4eHhjb25zdW1lciIsImF1ZCI6ImNvbnN1bWVyIiwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3MDQwNjcyMDAsImV4cCI6MTczNTY4OTYwMH0.example_sig",
  },
  ADMIN_LOGIN_TOTP_PENDING: {
    requireTotp: true,
    totpPendingToken:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbHh4eHhhZG1pbiIsImF1ZCI6ImFkbWluIiwidHlwZSI6InRvdHBfcGVuZGluZyIsImlhdCI6MTcwNDA2NzIwMCwiZXhwIjoxNzA0MDcwMDAwfQ.example_sig",
  },
  ADMIN_LOGIN_TOTP_SETUP_REQUIRED: {
    requireTotpSetup: true,
    totpSetupPendingToken:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbHh4eHhhZG1pbiIsImF1ZCI6ImFkbWluIiwidHlwZSI6InRvdHBfc2V0dXBfcGVuZGluZyIsImlhdCI6MTcwNDA2NzIwMCwiZXhwIjoxNzA0MDY5MDAwfQ.example_sig",
  },
  GOOGLE_CODE: "4/0AVGzR1BWFlPYjsU53FD39J4-JQPvDk5mcygFcOM0SBhus6Dw_8UsjZUxCvkKhtVIz92-1w",
  KAKAO_CODE: "abcde1234567890example",
  KAKAO_ID: "1234567890",
  KAKAO_EMAIL: "user@kakao.com",
  VERIFICATION_CODE: "123456",
} as const;

/**
 * Swagger 필드 설명 상수
 * 실제 검증 로직과 일치하는 설명을 제공합니다.
 */
export const SWAGGER_DESCRIPTIONS = {
  PHONE: "휴대폰 번호 (010, 011, 016, 017, 018, 019로 시작하는 10-11자리)",
  VERIFICATION_CODE: "인증번호 (6자리 숫자)",
  GOOGLE_CODE:
    "구글 OAuth Authorization Code (구매자/판매자 앱별 redirect_uri·클라이언트와 짝이 맞아야 함)",
  KAKAO_CODE: "카카오 OAuth Authorization Code (redirect_uri·REST API 키와 짝이 맞아야 함)",
  GOOGLE_ID: "구글 사용자 ID (userinfo `id`)",
  GOOGLE_EMAIL: "구글 계정 이메일",
  KAKAO_ID: "카카오 사용자 ID (`/v2/user/me`의 `id`)",
  KAKAO_EMAIL: "카카오 계정 이메일 (동의 항목에 따라 없을 수 있음)",
  DISPLAY_NAME: "이름 (구글 회원가입 시 필수, 1~50자)",
  NICKNAME: "표시용 닉네임 (구글 최초 가입 시 `{실명}_{난수}` 자동 부여 가능)",
  REFRESH_TOKEN: "리프레시 토큰",
  PHONE_VERIFICATION_PURPOSE:
    "인증 목적 enum — registration | google_registration | kakao_registration | phone_change | find_account (경로에 따라 audience는 consumer/seller로 고정)",
  PHONE_VERIFICATION_AUDIENCE:
    "요청 DTO에 포함되나, consumer/seller 각 인증 API에서는 서버가 audience를 덮어씁니다.",
  ADMIN_USERNAME: "관리자 아이디 (4-20자 영문·숫자·언더스코어)",
  ADMIN_PASSWORD: "관리자 비밀번호 (8자 이상, 영문 대소문자·숫자·특수문자 @$!%*?& 포함)",
} as const;
