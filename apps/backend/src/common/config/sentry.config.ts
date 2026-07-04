import * as Sentry from "@sentry/nestjs";
import { ConfigService } from "@nestjs/config";
import { isStagingOrProduction } from "@apps/backend/common/utils/environment.util";

/**
 * Sentry 초기화 설정
 * - 개발 환경: Sentry 비활성화
 * - 검증 환경(staging): Sentry 활성화
 * - 상용 환경(production): Sentry 활성화
 *
 * @param configService ConfigService 인스턴스
 */
export function initializeSentry(configService: ConfigService): void {
  const nodeEnv = configService.get<string>("NODE_ENV", "development");
  const sentryDsn = configService.get<string>("SENTRY_DSN");

  // 검증(staging) 또는 상용(production) 환경에서 Sentry 초기화
  if (isStagingOrProduction(nodeEnv) && sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      environment: nodeEnv, // 환경 태그 추가

      // Transaction 샘플링 비율 설정 (0 = Transaction 비활성화, 에러만 전송)
      // 에러 로깅만 필요하므로 Transaction 비활성화하여 비용 절감
      tracesSampleRate: 0, // Transaction 비활성화 (에러 이벤트만 전송)

      // 기본 PII 데이터 수집 비활성화 (개인정보 보호)
      sendDefaultPii: false,
    });
  }
}
