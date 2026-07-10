/**
 * NODE_ENV 값 상수
 * 환경 해석을 코드 전반에서 동일한 기준으로 사용하기 위해 중앙에서 관리합니다.
 */
export const NODE_ENV = {
  DEVELOPMENT: "development",
  STAGING: "staging",
  PRODUCTION: "production",
} as const;

export type NodeEnv = (typeof NODE_ENV)[keyof typeof NODE_ENV];
