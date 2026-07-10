import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { initPostHog } from "@/apps/web-seller/common/config/posthog.config";

/**
 * 라우트 변경 시 $pageview 이벤트를 수동 캡처합니다.
 * (react-router SPA 전환이라 자동 페이지뷰가 잡히지 않음)
 * 반드시 Router 내부에서 렌더링해야 합니다.
 */
export function PostHogPageView() {
  const location = useLocation();

  useEffect(() => {
    posthog.capture("$pageview", {
      $current_url: window.origin + location.pathname + location.search,
    });
  }, [location.pathname, location.search]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initPostHog();
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
