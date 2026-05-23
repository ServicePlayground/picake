import type { AudienceConst } from "@apps/backend/modules/auth/constants/auth.constants";

/**
 * 인증 관련 타입 정의
 */

/**
 * JWT 페이로드 (액세스·리프레시 공통 최소 필드) — 서명·검증용, HTTP 요청 DTO 아님
 */
export interface JwtPayload {
  sub: string;
  /** JWT `aud` 클레임 — `AUDIENCE` 상수 값과 동일한 리터럴 유니온(`AudienceConst`) */
  aud: AudienceConst;
}

/**
 * JWT 디코드·검증 결과 — 가드·전략 내부용, HTTP DTO 아님
 */
export interface JwtVerifiedPayload extends JwtPayload {
  type?: string;
  iat?: number;
  exp?: number;
}

/**
 * Passport JWT 검증 후 `req.user` — 전략에서 DB 조회로 보강한 형태, HTTP DTO 아님
 */
export interface AuthenticatedUser extends JwtVerifiedPayload {
  id: string;
  aud: AudienceConst;
  phone?: string;
  loginType?: "google" | "kakao";
  loginId?: string;
  /** aud === "seller" 일 때만 */
  sellerVerificationStatus?: "REGISTERED" | "BUSINESS_VERIFIED";
  /** aud === "admin" 일 때만 */
  username?: string;
}

/**
 * 구글 토큰 교환 직후 userinfo 조회 결과 — 서비스 내부 전달용, HTTP DTO 아님
 */
export interface GoogleUserInfo {
  userInfo: {
    googleId: string;
    googleEmail: string;
  };
}

/**
 * 카카오 토큰 교환 직후 userinfo 조회 결과 — 서비스 내부 전달용, HTTP DTO 아님
 */
export interface KakaoUserInfo {
  userInfo: {
    kakaoId: string;
    kakaoEmail: string;
  };
}
