/**
 * 애플리케이션 상수 정의
 * 전역적으로 사용되는 상수들을 중앙 집중식으로 관리합니다.
 */

// API 접두사
export const API_PREFIX = "/v1" as const;

/**
 * API 응답 메시지 상수
 */
export const API_RESPONSE_MESSAGES = {
  SUCCESS: "요청 성공",
  CREATED: "리소스 생성 성공",
  BAD_REQUEST: "잘못된 요청",
  UNAUTHORIZED: "권한 없음",
  NOT_FOUND: "리소스를 찾을 수 없음",
  CONFLICT: "중복된 사용자 정보",
  THROTTLE_LIMIT_EXCEEDED: "요청 횟수가 제한을 초과했습니다.",
  SERVICE_UNAVAILABLE: "서비스 점검 중입니다. 잠시 후 다시 이용해 주세요.",
  INTERNAL_SERVER_ERROR: "서버 내부 오류",
} as const;

/**
 * HTTP 상태 코드별 응답 메시지 매핑
 */
export const HTTP_STATUS_MESSAGES: Record<number, string> = {
  200: API_RESPONSE_MESSAGES.SUCCESS,
  201: API_RESPONSE_MESSAGES.CREATED,
  400: API_RESPONSE_MESSAGES.BAD_REQUEST,
  401: API_RESPONSE_MESSAGES.UNAUTHORIZED,
  404: API_RESPONSE_MESSAGES.NOT_FOUND,
  409: API_RESPONSE_MESSAGES.CONFLICT,
  429: API_RESPONSE_MESSAGES.THROTTLE_LIMIT_EXCEEDED,
  503: API_RESPONSE_MESSAGES.SERVICE_UNAVAILABLE,
  500: API_RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
} as const;
