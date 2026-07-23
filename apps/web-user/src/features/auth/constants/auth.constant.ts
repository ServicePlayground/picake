const AUTH_ERROR_MESSAGES = {
  PHONE_VERIFICATION_REQUIRED: "휴대폰 인증이 필요합니다.",
  PHONE_INVALID_FORMAT: "올바른 휴대폰번호 형식을 입력해주세요. (예: 01012345678)",
  VERIFICATION_CODE_INVALID_FORMAT: "올바른 인증번호 형식을 입력해주세요. (예: 123456)",
  NAME_REQUIRED: "이름을 입력해주세요.",
  NAME_MAX_LENGTH: "이름은 50자 이하로 입력해주세요.",
  /** 백엔드 `AUTH_ERROR_MESSAGES`와 동일 (OAuth 회원가입 409 응답 message 매칭용) */
  PHONE_GOOGLE_ACCOUNT_EXISTS: "해당 휴대폰 번호로 이미 등록된 구글 계정이 있습니다.",
  PHONE_KAKAO_ACCOUNT_EXISTS: "해당 휴대폰 번호로 이미 등록된 카카오 계정이 있습니다.",
  /** 백엔드 `AUTH_ERROR_MESSAGES.ACCOUNT_INACTIVE`와 동일 */
  ACCOUNT_INACTIVE: "비활성화된 계정입니다. 관리자에게 문의해주세요.",
} as const;

export { AUTH_ERROR_MESSAGES };
