import posthog, { type CaptureResult } from "posthog-js";

const POSTHOG_KEY = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
const NODE_ENV = import.meta.env.VITE_PUBLIC_NODE_ENV || "development";

/** PostHog 이벤트를 앱/환경별로 구분하기 위한 전역 속성 */
const SUPER_PROPERTIES = {
  app: "web-seller",
  environment: NODE_ENV,
};

/**
 * $current_url/$referrer 쿼리스트링에 남을 수 있는 민감정보 파라미터.
 * web-user의 소셜 로그인 콜백에서 실제로 관측된 키들과 동일한 패턴을 방어적으로 적용.
 */
const SENSITIVE_URL_PARAMS = [
  "code",
  "token",
  "access_token",
  "id_token",
  "googleEmail",
  "appleEmail",
  "googleId",
  "appleId",
  "iss",
  "scope",
  "authuser",
];

function sanitizeUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl);
    // /auth/* 는 OAuth 콜백·가입 플로우라 쿼리스트링 자체가 필요 없음 — 전부 제거
    if (url.pathname.startsWith("/auth/")) {
      url.search = "";
      return url.toString();
    }
    let changed = false;
    for (const key of SENSITIVE_URL_PARAMS) {
      if (url.searchParams.has(key)) {
        url.searchParams.delete(key);
        changed = true;
      }
    }
    return changed ? url.toString() : rawUrl;
  } catch {
    return rawUrl;
  }
}

/** 전송 직전의 모든 이벤트에서 $current_url/$referrer에 남은 민감정보를 제거합니다. */
function sanitizeEvent(event: CaptureResult | null): CaptureResult | null {
  if (!event?.properties) return event;
  if (typeof event.properties.$current_url === "string") {
    event.properties.$current_url = sanitizeUrl(event.properties.$current_url);
  }
  if (typeof event.properties.$referrer === "string") {
    event.properties.$referrer = sanitizeUrl(event.properties.$referrer);
  }
  return event;
}

/**
 * PostHog 클라이언트를 초기화합니다.
 * - 키가 없으면(로컬 등 미설정) 초기화를 건너뜁니다.
 * - 페이지뷰는 SPA 라우팅 특성상 수동 캡처하므로 자동 캡처를 비활성화합니다.
 */
export function initPostHog(): void {
  if (typeof window === "undefined" || !POSTHOG_KEY) {
    return;
  }

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    ui_host: "https://us.posthog.com",
    capture_pageview: false,
    capture_pageleave: true,
    person_profiles: "identified_only",
    before_send: sanitizeEvent,
    loaded: (ph) => {
      ph.register(SUPER_PROPERTIES);
    },
  });
}
