export const QNA_SELECT = {
  id: true,
  question: true,
  answer: true,
  category: true,
  isPinned: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

/** 카테고리별, 핀 고정 우선, 이후 등록일순(오래된 순) */
export const QNA_LIST_ORDER_BY = [
  { category: "asc" },
  { isPinned: "desc" },
  { createdAt: "asc" },
] as const;

export const QNA_ERROR_MESSAGES = {
  NOT_FOUND: "Q&A를 찾을 수 없습니다.",
} as const;
