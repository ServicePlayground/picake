import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common";
import { Response } from "express";
import { randomUUID } from "crypto";
import { randomBytes } from "crypto";
import { SensitiveDataUtil } from "@apps/backend/common/utils/sensitive-data.util";
import { SentryUtil } from "@apps/backend/common/utils/sentry.util";
import { LoggerUtil } from "@apps/backend/common/utils/logger.util";

/**
 * Error Response Interceptor
 * 모든 예외를 통일된 응답 형태로 처리하고 Sentry로 전송합니다.
 */
@Catch()
export class ErrorResponseInterceptor implements ExceptionFilter {
  /**
   * 예외를 처리하고 클라이언트에게 응답을 전송합니다.
   * @param exception - 발생한 예외 객체
   * @param host - ArgumentsHost 객체 (요청/응답 정보 포함)
   */
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse<Response>();

    // HTTP 상태 코드 결정
    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    // 에러 메시지 추출
    const data = exception instanceof HttpException ? exception.getResponse() : "";

    // Response ID 생성 (에러 응답 구분자 포함)
    const responseId = `${Date.now()}-error-${randomUUID()}-${randomBytes(4).toString("hex")}`;

    // Response 헤더에 추가 (클라이언트가 추적할 수 있도록)
    response.setHeader("X-Response-ID", responseId);

    // 통일된 에러 응답 객체 생성
    const errorResponse = {
      success: false,
      data: data,
      timestamp: new Date().toISOString(),
      statusCode: status,
      responseId: responseId,
    };

    // 민감 정보 제거
    const sanitizedError = SensitiveDataUtil.sanitizeError(exception);
    const sanitizedData = SensitiveDataUtil.maskSensitiveFields(data);

    // 에러 로깅 (개발, 검증)
    const baseMessage = `[${responseId}] Error: ${request.method} ${request.url} - ${status}`;
    const detailedMessage = sanitizedData
      ? `${baseMessage}\n${JSON.stringify(sanitizedData, null, 2)}`
      : baseMessage;
    LoggerUtil.log(detailedMessage);
    LoggerUtil.log(`[${responseId}] Error details:`, sanitizedError);

    // Sentry로 전송 (검증, 상용)
    const shouldSend = SentryUtil.shouldSendToSentry(status);
    const level = SentryUtil.getErrorLevel(status);
    if (shouldSend) {
      // 예외 전송 (responseId를 태그로 추가하여 클라이언트에서 Sentry에서 찾을 수 있도록)
      SentryUtil.captureException(exception, level, { responseId });
    }

    // 클라이언트에게 통일된 JSON 형태로 에러 응답 전송
    response.status(status).json(errorResponse);
  }
}
