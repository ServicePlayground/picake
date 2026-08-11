export const AI_ASSISTANT_ERROR_MESSAGES = {
  STORE_NOT_FOUND: "스토어를 찾을 수 없습니다.",
  STORE_NOT_OWNED: "해당 스토어에 대한 권한이 없습니다.",
  SETTING_NOT_FOUND: "AI 자동응답 설정을 찾을 수 없습니다.",
  FAQ_NOT_FOUND: "FAQ를 찾을 수 없습니다.",
  UNANSWERED_QUESTION_NOT_FOUND: "질문을 찾을 수 없습니다.",
  MESSAGE_NOT_FOUND: "메시지를 찾을 수 없습니다.",
  FEEDBACK_NOT_ALLOWED: "AI 답변에만 피드백을 남길 수 있습니다.",
} as const;

/** 스토어별 일일 AI 호출 한도 (비용 폭주/어뷰징 방지, 초과 시 "모르겠다" 폴백) */
export const AI_DAILY_LIMIT_PER_STORE = 200;
/** 구매자별 일일 AI 호출 한도 */
export const AI_DAILY_LIMIT_PER_CONSUMER = 50;

/** 판매자 무응답 안내 임계값 (영업시간 중, ms) */
export const AWAITING_SELLER_NUDGE_THRESHOLD_MS = 30 * 60 * 1000;
/** 무응답 스윕 주기 (ms) — order-automation.service.ts와 동일한 setInterval 패턴 */
export const AWAITING_SELLER_SWEEP_INTERVAL_MS = 5 * 60 * 1000;

/** LLM 호출 타임아웃 (ms) — 초과 시 "모르겠다" 폴백 */
export const AI_GENERATION_TIMEOUT_MS = 20 * 1000;
/** 컨텍스트에 포함할 최근 대화 메시지 수 (CONSUMER/STORE 텍스트만, SYSTEM/카드 제외) */
export const AI_CONTEXT_RECENT_MESSAGE_COUNT = 20;

/** OPENAI_MODEL 환경변수 미설정 시 기본 모델 */
export const AI_DEFAULT_MODEL = "gpt-5-mini";

/** 시스템 안내 메시지 문구 */
export const AI_SYSTEM_MESSAGES = {
  /** 이관 확정 직후 (연결 확인) */
  HANDOFF_CONFIRMED: "사장님과 연결되었어요. 곧 답변드릴게요 🙂",
  /** 영업시간 외 이관 — 이행할 수 없는 약속(구체적 시간)을 하지 않는다 */
  OUTSIDE_BUSINESS_HOURS: "지금은 영업시간이 아니에요. 영업 시작 후 순서대로 답변드릴게요.",
  /** 영업시간 중 30분 무응답 — 이유를 제공해 손님이 상황을 납득하게 한다 */
  SELLER_BUSY: "사장님이 지금 케이크 제작 중이라 답변이 조금 늦어지고 있어요. 확인 즉시 답변드릴게요.",
} as const;

/** AI가 답하지 못할 때의 응답 문구 (LLM 실패/한도 초과 폴백에도 동일 사용) */
export const AI_FALLBACK_ANSWER = "음, 이 부분은 제가 정확히 답변드리기 어려워요. 사장님과 연결해드릴까요?";
