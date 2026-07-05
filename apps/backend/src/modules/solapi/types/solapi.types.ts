/**
 * 단일 SMS 발송 요청 파라미터.
 * `from`(발신번호)은 `SolapiService`가 환경변수에서 주입하므로 호출자는 지정하지 않습니다.
 */
export interface SendSmsParams {
  /** 수신번호 (하이픈 포함 가능, 내부에서 정규화) */
  to: string;
  /** 메시지 본문 (길이에 따라 SOLAPI가 SMS/LMS 자동 판별) */
  text: string;
}

/**
 * 단일 SMS 발송 결과.
 */
export interface SendSmsResult {
  /** SOLAPI가 반환한 메시지 ID */
  messageId: string;
}

/**
 * 카카오 알림톡 발송 요청 파라미터.
 * `pfId`(발신 프로필 키)·`from`(발신번호)은 `SolapiService`가 환경변수에서 주입합니다.
 */
export interface SendAlimtalkParams {
  /** 수신번호 (하이픈 포함 가능, 내부에서 정규화) */
  to: string;
  /** 카카오 비즈메시지 센터에 등록·승인된 알림톡 템플릿 ID */
  templateId: string;
  /** 템플릿 치환 변수 (키는 `#{변수명}` 형식, 등록된 템플릿과 정확히 일치해야 함) */
  variables?: Record<string, string>;
  /**
   * 알림톡 발송 실패 시 대체 발송할 SMS 본문.
   * `disableSms`가 false일 때만 사용됩니다.
   */
  fallbackText?: string;
  /**
   * 알림톡 실패 시 SMS 대체 발송 비활성화 여부.
   * 기본 true (대체 발송하지 않음).
   */
  disableSms?: boolean;
}

/**
 * 카카오 알림톡 발송 결과.
 */
export interface SendAlimtalkResult {
  /** SOLAPI가 반환한 메시지 ID */
  messageId: string;
}
