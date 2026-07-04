import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { isDevelopmentOrStaging } from "@apps/backend/common/utils/environment.util";

/**
 * 로깅 유틸리티 함수
 * 개발(development)과 검증(staging) 환경에서만 로깅을 수행합니다.
 * 운영(production) 환경에서는 로깅을 수행하지 않습니다.
 */
export class LoggerUtil {
  private static nodeEnv: string | null = null;
  private static readonly logger = new Logger();

  /**
   * LoggerUtil 초기화
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
   * 개발/검증 환경인지 확인
   */
  private static isLoggingEnabled(): boolean {
    if (!this.nodeEnv) {
      return true;
    }
    // 개발(development)과 검증(staging) 환경에서만 로깅을 수행합니다.
    return isDevelopmentOrStaging(this.nodeEnv);
  }

  /**
   * 로그 레벨: 일반 정보
   * @param message 로그 메시지
   * @param optionalParams 추가 파라미터
   */
  static log(message: string, ...optionalParams: any[]): void {
    if (!this.isLoggingEnabled()) {
      return;
    }
    this.logger.log(message, ...optionalParams);
  }
}
