export const NOTICE_SELECT = {
  id: true,
  title: true,
  content: true,
  isPinned: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

/** 핀 고정 우선, 이후 등록일순(오래된 순) */
export const NOTICE_LIST_ORDER_BY = [{ isPinned: "desc" }, { createdAt: "asc" }] as const;

export const NOTICE_ERROR_MESSAGES = {
  NOT_FOUND: "공지사항을 찾을 수 없습니다.",
} as const;
