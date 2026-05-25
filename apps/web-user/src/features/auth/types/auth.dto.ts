import { AUTH_ERROR_MESSAGES } from "@/apps/web-user/features/auth/constants/auth.constant";

/** 백엔드 JWT `aud`와 동일 */
export const AUDIENCE = {
  CONSUMER: "consumer",
  SELLER: "seller",
  ADMIN: "admin",
} as const;
export type AudienceConst = (typeof AUDIENCE)[keyof typeof AUDIENCE];

export const PHONE_VERIFICATION_PURPOSE = {
  REGISTRATION: "registration",
  GOOGLE_REGISTRATION: "google_registration",
  KAKAO_REGISTRATION: "kakao_registration",
  PHONE_CHANGE: "phone_change",
  FIND_ACCOUNT: "find_account",
} as const;
export type PhoneVerificationPurpose =
  (typeof PHONE_VERIFICATION_PURPOSE)[keyof typeof PHONE_VERIFICATION_PURPOSE];

export interface TokenResponseDto {
  accessToken: string;
  refreshToken?: string;
}

export interface GoogleLoginRequestDto {
  code: string;
}

export interface KakaoLoginRequestDto {
  code: string;
}

export interface GoogleRegisterRequestDto {
  googleId: string;
  googleEmail: string;
  name: string;
  phone: string;
  agreedToTerms: boolean;
  agreedToPrivacy: boolean;
  agreedToThirdParty: boolean;
  agreedToLocationTerms: boolean;
  /** 동의한 약관 문서 ID 목록 (버전 이력 기록용) */
  termsDocumentIds?: string[];
}

export interface KakaoRegisterRequestDto {
  kakaoId: string;
  kakaoEmail: string;
  name: string;
  phone: string;
  agreedToTerms: boolean;
  agreedToPrivacy: boolean;
  agreedToThirdParty: boolean;
  agreedToLocationTerms: boolean;
  /** 동의한 약관 문서 ID 목록 (버전 이력 기록용) */
  termsDocumentIds?: string[];
}

export interface VerifyPhoneCodeRequestDto {
  phone: string;
  verificationCode: string;
  audience: AudienceConst;
  purpose: PhoneVerificationPurpose;
}

export interface MessageResponseDto {
  message: string;
  /** 인증번호 입력 만료 시각 (ISO 8601) — `POST .../send-verification-code` 응답에 포함 */
  expiresAt?: string;
}

export type DuplicateAccountPayload = {
  message:
    | typeof AUTH_ERROR_MESSAGES.PHONE_KAKAO_ACCOUNT_EXISTS
    | typeof AUTH_ERROR_MESSAGES.PHONE_GOOGLE_ACCOUNT_EXISTS;
  name: string;
  phone: string;
};

export type OAuthLoginProvider = "google" | "kakao";
