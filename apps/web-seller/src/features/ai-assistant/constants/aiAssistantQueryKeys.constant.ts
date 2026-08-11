/**
 * AI 자동응답 관련 쿼리 키 상수
 */
export const aiAssistantQueryKeys = {
  all: ["ai-assistant"] as const,
  settings: (storeId: string) => ["ai-assistant", "settings", storeId] as const,
  faqs: (storeId: string) => ["ai-assistant", "faqs", storeId] as const,
  unansweredQuestions: (storeId: string) =>
    ["ai-assistant", "unanswered-questions", storeId] as const,
  stats: (storeId: string, days: number) => ["ai-assistant", "stats", storeId, days] as const,
} as const;
