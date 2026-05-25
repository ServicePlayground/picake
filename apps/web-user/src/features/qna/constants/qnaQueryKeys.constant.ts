/**
 * Q&A React Query 키
 */
export const qnaQueryKeys = {
  all: ["qna"] as const,
  list: () => [...qnaQueryKeys.all, "list"] as const,
} as const;
