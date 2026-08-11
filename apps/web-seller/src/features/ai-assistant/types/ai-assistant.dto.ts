/**
 * AI 자동응답 API 타입 (백엔드 ai-assistant DTO와 1:1 정합)
 */

export type AiScheduleMode = "ALWAYS" | "OUTSIDE_BUSINESS_HOURS" | "OFF";

/** 매장 정보 연동 상태 — 초안 생성 버튼 활성화 조건 판단용 */
export interface StoreInfoStatusDto {
  hasDescription: boolean;
  hasBusinessHours: boolean;
  hasRefundPolicy: boolean;
}

export interface AiAssistantSettingsResponseDto {
  /** 설정이 없으면 AI가 동작하지 않음(opt-in) */
  configured: boolean;
  scheduleMode: AiScheduleMode;
  instructions: string | null;
  updatedAt: Date | null;
  storeInfoStatus: StoreInfoStatusDto;
}

export interface UpdateAiAssistantSettingsRequestDto {
  instructions?: string;
  scheduleMode?: AiScheduleMode;
}

export interface AiFaqResponseDto {
  id: string;
  storeId: string;
  question: string;
  answer: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpsertAiFaqRequestDto {
  question: string;
  answer: string;
}

export interface AiUnansweredQuestionResponseDto {
  id: string;
  storeId: string;
  roomId: string;
  questionText: string;
  /** 핸드오프 후 판매자가 실제로 답한 내용 (FAQ 등록 초안) */
  sellerAnswerDraft: string | null;
  status: "PENDING" | "CONVERTED_TO_FAQ" | "DISMISSED";
  createdAt: Date;
}

/** 미리테스트 응답 */
export interface AiPreviewTestResponseDto {
  answer: string;
  canAnswer: boolean;
  requestsHuman: boolean;
}

export interface AiInstructionsDraftResponseDto {
  draft: string | null;
}

export interface AiStatsResponseDto {
  aiMessageCount: number;
  /** AI가 못 답해 사람에게 넘어간 건수 */
  handoffCount: number;
  unansweredCount: number;
  feedback: { positive: number; negative: number };
  /** AI vs 사람 이관 평균 응답시간 (ms) — 데이터가 없으면 null */
  avgResponseMs: { ai: number | null; human: number | null };
  dailyCounts: { date: string; count: number }[];
}
