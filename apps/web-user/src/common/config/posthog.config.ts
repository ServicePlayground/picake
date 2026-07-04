import posthog from "posthog-js";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
const NODE_ENV = process.env.NEXT_PUBLIC_NODE_ENV ?? "development";

/** PostHog 이벤트를 앱/환경별로 구분하기 위한 전역 속성 */
const SUPER_PROPERTIES = {
  app: "web-user",
  environment: NODE_ENV,
};

/**
 * PostHog 클라이언트를 초기화합니다.
 * - 키가 없으면(로컬 등 미설정) 초기화를 건너뜁니다.
 * - 페이지뷰는 App Router 특성상 수동 캡처하므로 자동 캡처를 비활성화합니다.
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
    loaded: (ph) => {
      ph.register(SUPER_PROPERTIES);
    },
  });
}
