import { LoggerUtil } from "@apps/backend/common/utils/logger.util";
import { SentryUtil } from "@apps/backend/common/utils/sentry.util";

/**
 * 외부 API / OAuth 실패 보고용 컨텍스트.
 * client_secret, authorization code, access_token 등 민감정보는 넣지 않는다.
 */
export type ExternalApiFailureContext = {
  /** 연동 대상 (예: google, kakao, nts) */
  provider: string;
  /** Sentry module 태그 (예: auth-google-oauth) */
  module: string;
  /** Sentry operation 태그 (예: token-exchange) */
  operation: string;
  httpStatus?: number;
  /** 제공자 에러 코드 (예: invalid_client, redirect_uri_mismatch) */
  providerError?: string;
  providerErrorDescription?: string;
  axiosCode?: string;
  axiosMessage?: string;
  /** redirectUri, hasId 등 민감하지 않은 추가 디버그 정보 */
  details?: Record<string, unknown>;
};

/**
 * 외부 API 통신 실패를 로그·Sentry에 일관된 형태로 남긴다.
 */
export class ExternalApiErrorUtil {
  /**
   * OAuth2 / 일반 API 응답 본문에서 에러 코드·설명을 추출한다.
   * - OAuth2: `{ error, error_description }`
   * - Google 일부 API: `{ error: { status, message } }`
   * - Kakao API: `{ code, msg }`
   */
  static extractProviderError(data: unknown): {
    code?: string;
    description?: string;
  } {
    if (!data || typeof data !== "object") {
      return {};
    }

    const record = data as Record<string, unknown>;

    if (typeof record.error === "string") {
      return {
        code: record.error,
        description:
          typeof record.error_description === "string" ? record.error_description : undefined,
      };
    }

    if (record.error && typeof record.error === "object") {
      const nested = record.error as Record<string, unknown>;
      const code =
        typeof nested.status === "string"
          ? nested.status
          : typeof nested.code === "string" || typeof nested.code === "number"
            ? String(nested.code)
            : undefined;
      const description = typeof nested.message === "string" ? nested.message : undefined;
      return { code, description };
    }

    if (typeof record.code === "string" || typeof record.code === "number") {
      return {
        code: String(record.code),
        description: typeof record.msg === "string" ? record.msg : undefined,
      };
    }

    if (typeof record.error_description === "string") {
      return { description: record.error_description };
    }

    return {};
  }

  /**
   * Axios 에러(또는 유사 객체)에서 보고용 필드를 뽑는다.
   */
  static fromAxiosError(error: {
    code?: string;
    message?: string;
    response?: { status?: number; data?: unknown };
  }): Pick<
    ExternalApiFailureContext,
    "httpStatus" | "providerError" | "providerErrorDescription" | "axiosCode" | "axiosMessage"
  > {
    const providerError = this.extractProviderError(error.response?.data);
    return {
      httpStatus: error.response?.status,
      providerError: providerError.code,
      providerErrorDescription: providerError.description,
      axiosCode: error.code,
      axiosMessage: error.message,
    };
  }

  /**
   * 응답 본문(4xx validateStatus 통과 등)에서 보고용 필드를 뽑는다.
   */
  static fromResponseBody(
    data: unknown,
    httpStatus?: number,
  ): Pick<ExternalApiFailureContext, "httpStatus" | "providerError" | "providerErrorDescription"> {
    const providerError = this.extractProviderError(data);
    return {
      httpStatus,
      providerError: providerError.code,
      providerErrorDescription: providerError.description,
    };
  }

  /**
   * Sentry 이벤트 제목용 Error를 만든다.
   */
  static createFailureError(context: ExternalApiFailureContext, fallbackReason: string): Error {
    const reason = context.providerError ?? fallbackReason;
    return new Error(`${context.provider} ${context.operation} failed: ${reason}`);
  }

  /**
   * 외부 API 실패를 Logger·Sentry에 기록한다.
   */
  static reportFailure(context: ExternalApiFailureContext, exception: unknown): void {
    const payload = {
      provider: context.provider,
      module: context.module,
      operation: context.operation,
      httpStatus: context.httpStatus,
      providerError: context.providerError,
      providerErrorDescription: context.providerErrorDescription,
      axiosCode: context.axiosCode,
      axiosMessage: context.axiosMessage,
      ...(context.details ?? {}),
    };

    LoggerUtil.log(
      `[${context.provider}] ${context.operation} 에러 발생: ${JSON.stringify(payload, null, 2)}`,
    );

    const tags: Record<string, string> = {
      module: context.module,
      operation: context.operation,
      provider: context.provider,
    };
    if (context.providerError) {
      tags.provider_error = context.providerError;
    }
    if (context.httpStatus != null) {
      tags.provider_http_status = String(context.httpStatus);
    }

    const level =
      context.httpStatus == null || context.httpStatus >= 500
        ? ("error" as const)
        : ("warning" as const);

    SentryUtil.captureException(exception, level, tags, { externalApi: payload });
  }
}
