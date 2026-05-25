/**
 * Notice 관련 쿼리 키 상수
 */
export const noticeQueryKeys = {
  all: ["notice"] as const,
  lists: () => [...noticeQueryKeys.all, "list"] as const,
  list: () => [...noticeQueryKeys.lists()] as const,
} as const;
