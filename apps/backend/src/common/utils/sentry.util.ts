import * as Sentry from "@sentry/nestjs";
import { ConfigService } from "@nestjs/config";
import { LoggerUtil } from "./logger.util";
import { isStagingOrProduction } from "@apps/backend/common/utils/environment.util";

/**
 * Sentry 유틸리티
 * 에러 로깅 및 모니터링을 위한 공통 유틸리티
 */
export class SentryUtil {
  private static nodeEnv: string | null = null;

  /**
   * SentryUtil 초기화
   * ConfigService를 설정하여 환경 변수를 사용할 수 있도록 합니다.
   * @param configService ConfigService 인스턴스
   */
  static initialize(configService: ConfigService): void {
    const nodeEnv = configService.get<string>("NODE_ENV", "development");
    if (!nodeEnv) {
      throw new Error("NODE_ENV 환경 변수가 설정되어 있지 않습니다.");
    }
    this.nodeEnv = nodeEnv;
  }

  /**
   * Sentry 전송이 활성화되어 있는지 확인
   */
  static enabled(): boolean {
    if (!this.nodeEnv) {
      return true;
    }
    // 검증(staging)과 상용(production) 환경에서만 Sentry 전송을 수행합니다.
    return isStagingOrProduction(this.nodeEnv);
  }

  /**
   * 에러를 Sentry로 전송해야 하는지 판단
   * @param statusCode HTTP 상태 코드
   */
  static shouldSendToSentry(statusCode: number): boolean {
    // 점검 모드(503)는 의도된 응답이므로 Sentry 전송 제외
    if (statusCode === 503) {
      return false;
    }

    // 5xx 에러는 항상 전송
    if (statusCode >= 500) {
      return true;
    }

    // 그 외 4xx 에러는 전송하지 않음 (노이즈 방지)
    return false;
  }

  /**
   * 에러 레벨 결정
   * @param statusCode HTTP 상태 코드
   */
  static getErrorLevel(statusCode: number): Sentry.SeverityLevel {
    // HTTP 상태 코드 기반 레벨 결정
    let level: Sentry.SeverityLevel = "error";
    if (statusCode >= 500) {
      level = "error";
    } else if (statusCode >= 400) {
      level = "warning";
    } else {
      level = "info";
    }
    return level;
  }

  /**
   * 예외를 Sentry로 전송
   * @param exception 예외 객체
   * @param level 에러 레벨
   * @param tags Sentry 태그 (예: { responseId: "xxx" })
   */
  static captureException(
    exception: unknown,
    level: Sentry.SeverityLevel,
    tags?: Record<string, string>,
  ): void {
    if (!this.enabled()) {
      return;
    }
    try {
      // 예외 전송
      Sentry.captureException(exception, {
        level,
        tags,
      });
    } catch (error) {
      // Sentry 전송 실패 시 로그만 기록
      LoggerUtil.log(
        `Sentry 예외 전송 실패: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 메시지를 Sentry로 전송
   * @param message 전송할 메시지
   * @param level 메시지 레벨
   * @param tags Sentry 태그
   */
  static captureMessage(
    message: string,
    level: Sentry.SeverityLevel = "info",
    tags?: Record<string, string>,
  ): void {
    if (!this.enabled()) {
      return;
    }
    try {
      Sentry.captureMessage(message, {
        level,
        tags,
      });
    } catch (error) {
      LoggerUtil.log(
        `Sentry 메시지 전송 실패: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
