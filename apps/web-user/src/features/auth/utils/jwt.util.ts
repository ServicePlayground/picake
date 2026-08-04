/**
 * 액세스 토큰의 payload(JWT 두 번째 세그먼트)를 서명 검증 없이 디코딩합니다.
 * 분석 이벤트에 user_id(sub)를 싣기 위한 용도로만 사용 — 인증/보안 판단에는 사용하지 않습니다.
 */
export function decodeJwtPayload<T = Record<string, unknown>>(token: string): T | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((char) => "%" + char.charCodeAt(0).toString(16).padStart(2, "0"))
        .join(""),
    );
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}
