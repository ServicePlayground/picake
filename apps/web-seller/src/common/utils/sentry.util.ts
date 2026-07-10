import { AxiosError } from "axios";
import * as Sentry from "@sentry/react";
import { isSentryEnabled } from "@/apps/web-seller/common/config/sentry.config";

/**
 * Sentry 유틸리티
 * 에러 로깅 및 모니터링을 위한 공통 유틸리티 (백엔드 SentryUtil과 동일 정책)
 */

/** 에러를 Sentry로 전송해야 하는지 판단 (백엔드와 동일: 5xx만) */
export function shouldSendToSentry(statusCode?: number): boolean {
  if (statusCode === undefined) {
    // 네트워크 오류 등 응답 없음 → 전송
    return true;
  }

  return statusCode >= 500;
}

function getHttpStatus(error: unknown): number | undefined {
  if (error instanceof AxiosError) {
    return error.response?.status;
  }

  return undefined;
}

export function captureSentryException(
  exception: unknown,
  captureContext?: Parameters<typeof Sentry.captureException>[1],
): void {
  if (!isSentryEnabled()) {
    return;
  }

  try {
    Sentry.captureException(exception, captureContext);
  } catch (error) {
    console.error("Sentry 예외 전송 실패:", error);
  }
}

/** API(axios) 에러를 Sentry로 전송 — 5xx 및 네트워크 오류만 (4xx는 노이즈 방지) */
export function captureSentryApiError(error: unknown): void {
  if (!isSentryEnabled()) {
    return;
  }

  const status = getHttpStatus(error);
  if (!shouldSendToSentry(status)) {
    return;
  }

  captureSentryException(error, {
    tags: status !== undefined ? { http_status: String(status) } : { http_status: "network" },
  });
}
