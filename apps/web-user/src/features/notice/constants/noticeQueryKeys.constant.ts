/**
 * 공지사항 React Query 키
 */
export const noticeQueryKeys = {
  all: ["notice"] as const,
  list: () => [...noticeQueryKeys.all, "list"] as const,
} as const;
