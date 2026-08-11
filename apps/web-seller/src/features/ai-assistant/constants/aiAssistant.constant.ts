import type { AiScheduleMode } from "@/apps/web-seller/features/ai-assistant/types/ai-assistant.dto";

export const AI_SCHEDULE_MODE_OPTIONS: {
  value: AiScheduleMode;
  label: string;
  description: string;
}[] = [
  {
    value: "ALWAYS",
    label: "항상 AI 사용",
    description: "영업 중에도 AI가 먼저 답합니다. 모르는 질문은 사장님께 연결됩니다.",
  },
  {
    value: "OUTSIDE_BUSINESS_HOURS",
    label: "영업시간 외에만 AI 사용",
    description: "영업 중에는 사장님이 직접 응대하고, 영업시간 외 문의만 AI가 답합니다.",
  },
  {
    value: "OFF",
    label: "AI 사용 안 함",
    description: "모든 문의를 사장님이 직접 응대합니다.",
  },
];

/**
 * 미리테스트 샘플 질문
 * 지침 안에 있을 법한 질문(answerable)과 밖에 있을 법한 질문(unanswerable)을 나눠 제공해,
 * 사장님이 "AI가 모른다고 답하는 경험"을 미리 해보고 지침을 보완하도록 유도합니다.
 */
export const AI_SAMPLE_QUESTIONS = {
  answerable: ["영업시간이 어떻게 되나요?", "환불은 며칠 전까지 가능해요?", "픽업은 어떻게 하나요?"],
  unanswerable: [
    "이 케이크 다른 색상으로도 제작 가능한가요?",
    "당일 주문도 가능한가요?",
    "10만원에 맞춰줄 수 있나요?",
  ],
} as const;

/** 응답시간(ms)을 사람이 읽는 문자열로 */
export function formatResponseDuration(ms: number | null): string {
  if (ms === null) return "-";
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}초`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}분`;
  const hours = Math.floor(minutes / 60);
  return `${hours}시간 ${minutes % 60}분`;
}
