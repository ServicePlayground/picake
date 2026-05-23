/**
 * Auth 관련 쿼리 키 상수
 */
export const authQueryKeys = {
  /** GET /v1/admin/auth/me */
  me: ["auth", "admin"] as const,
} as const;
