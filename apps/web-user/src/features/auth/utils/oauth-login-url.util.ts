import { PATHS } from "@/apps/web-user/common/constants/paths.constant";
import { NODE_ENV } from "@/apps/web-user/common/constants/environment.constants";

/**
 * 브라우저에서 카카오 OAuth 로그인 시작 URL (동일 도메인 redirect_uri)
 */
export function getKakaoOAuthLoginUrl(): string | null {
  if (typeof window === "undefined") return null;
  const clientId = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;
  if (!clientId) return null;
  const redirectUri = `${window.location.origin}${PATHS.AUTH.KAKAO_REDIRECT_URI}`;
  return `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
}

/**
 * 브라우저에서 구글 OAuth 로그인 시작 URL (동일 도메인 redirect_uri)
 */
export function getGoogleOAuthLoginUrl(): string | null {
  if (typeof window === "undefined") return null;
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) return null;
  const redirectUri = `${window.location.origin}${PATHS.AUTH.GOOGLE_REDIRECT_URI}`;
  return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=email+profile&prompt=select_account`;
}

/**
 * Apple Return URL(Services ID Website URLs)은 HTTPS 도메인만 등록 가능해 `window.location.origin`
 * (dev=localhost)을 쓸 수 없습니다. dev도 staging 도메인으로 고정 — 실제 콜백 처리는 스테이징
 * 배포본이 담당합니다(로컬로 돌아오지 않음). `getAppleAppSiteAssociation`과 동일한 패턴.
 */
function getAppleRedirectBaseUrl(): string {
  const nodeEnv = process.env.NEXT_PUBLIC_NODE_ENV;
  return nodeEnv === NODE_ENV.PRODUCTION ? "https://picakes.com" : "https://staging.picakes.com";
}

/**
 * 브라우저에서 애플 OAuth 로그인 시작 URL.
 * `scope=email` 요청 시 Apple이 `response_mode=form_post`를 강제하므로 인가 응답은 GET 쿼리가 아니라
 * `/auth/login/apple`(route.ts)로 POST 됩니다 — Google/Kakao와 달리 페이지가 아닌 route handler가 받습니다.
 */
export function getAppleOAuthLoginUrl(): string | null {
  const clientId = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;
  if (!clientId) return null;
  const redirectUri = `${getAppleRedirectBaseUrl()}${PATHS.AUTH.APPLE_REDIRECT_URI}`;
  return `https://appleid.apple.com/auth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&response_mode=form_post&scope=email`;
}
