import * as Sentry from "@sentry/react";
import { isStagingOrProduction } from "@/apps/web-seller/common/utils/environment.util";

const SENTRY_DSN = import.meta.env.VITE_PUBLIC_SENTRY_DSN;
const NODE_ENV = import.meta.env.VITE_PUBLIC_NODE_ENV || "development";

/**
 * Sentry 전송 활성화 여부
 * - 개발 환경: 비활성화
 * - 검증(staging)/상용(production): DSN이 있을 때만 활성화
 * (백엔드 Sentry 정책과 동일)
 */
export function isSentryEnabled(): boolean {
  return isStagingOrProduction(NODE_ENV) && !!SENTRY_DSN;
}

/** 공통 Sentry 초기화 옵션 */
export const sentryInitOptions = {
  dsn: SENTRY_DSN,
  environment: NODE_ENV,
  // 트랜잭션 비활성화 (에러만 전송하여 비용 절감) — 백엔드와 동일
  tracesSampleRate: 0,
  // 기본 PII 수집 비활성화 (개인정보 보호) — 백엔드와 동일
  sendDefaultPii: false,
};

/**
 * Sentry 클라이언트를 초기화합니다.
 * 앱 진입점(main.tsx)에서 렌더링 전에 1회 호출합니다.
 */
export function initSentry(): void {
  if (!isSentryEnabled()) {
    return;
  }

  Sentry.init(sentryInitOptions);
}
