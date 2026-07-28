import { PATHS } from "@/apps/web-user/common/constants/paths.constant";

const STORAGE_KEY = "picake:postLoginRedirect";

/**
 * 로그인 완료 후 돌아갈 경로 관리.
 * OAuth 는 외부 도메인을 왕복하므로 같은 탭에서 유지되는 sessionStorage 를 사용한다.
 */

/** 로그인 시작 시점의 경로 저장 (미지정 시 현재 경로) */
export function setPostLoginRedirect(path?: string): void {
  if (typeof window === "undefined") return;

  const target = path ?? `${window.location.pathname}${window.location.search}`;
  // 로그인/회원가입 콜백 경로는 복귀 대상이 아님
  if (target.startsWith("/auth/")) return;

  window.sessionStorage.setItem(STORAGE_KEY, target);
}

/** 저장된 복귀 경로를 꺼내면서 제거. 없거나 유효하지 않으면 홈 */
export function consumePostLoginRedirect(): string {
  if (typeof window === "undefined") return PATHS.HOME;

  const target = window.sessionStorage.getItem(STORAGE_KEY);
  window.sessionStorage.removeItem(STORAGE_KEY);

  // 외부 URL 로의 이동을 막기 위해 앱 내부 경로만 허용
  if (!target || !target.startsWith("/") || target.startsWith("//")) return PATHS.HOME;
  return target;
}

/** 저장된 복귀 경로 폐기 (로그인 실패 등으로 복귀가 무의미해진 경우) */
export function clearPostLoginRedirect(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(STORAGE_KEY);
}
