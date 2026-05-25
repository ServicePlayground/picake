/**
 * Q&A 관련 쿼리 키 상수
 */
export const qnaQueryKeys = {
  all: ["qna"] as const,
  lists: () => [...qnaQueryKeys.all, "list"] as const,
  list: () => [...qnaQueryKeys.lists()] as const,
} as const;
