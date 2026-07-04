import { NODE_ENV } from "@apps/backend/common/constants/environment.constants";

/**
 * NODE_ENV 해석 유틸리티
 * `=== "production"` / `!== "production"` 같은 문자열 비교가 코드 전반에 흩어지지 않도록
 * 환경 판별 로직을 한 곳으로 모읍니다.
 */

/** 상용(production) 환경 여부 */
export function isProduction(nodeEnv?: string | null): boolean {
  return nodeEnv === NODE_ENV.PRODUCTION;
}

/** production 이 아닌 모든 환경 (development, staging, 미설정 등) */
export function isNonProduction(nodeEnv?: string | null): boolean {
  return !isProduction(nodeEnv);
}

/** 검증(staging) 또는 상용(production) 환경 여부 */
export function isStagingOrProduction(nodeEnv?: string | null): boolean {
  return nodeEnv === NODE_ENV.STAGING || nodeEnv === NODE_ENV.PRODUCTION;
}

/** 개발(development) 또는 검증(staging) 환경 여부 */
export function isDevelopmentOrStaging(nodeEnv?: string | null): boolean {
  return nodeEnv === NODE_ENV.DEVELOPMENT || nodeEnv === NODE_ENV.STAGING;
}
