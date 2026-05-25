export const HOME_BANNER_SELECT = {
  id: true,
  imageUrl: true,
  linkUrl: true,
  startsAt: true,
  endsAt: true,
  sortOrder: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

/** 홈 배너 최대 등록 개수 */
export const HOME_BANNER_MAX_COUNT = 10;

export const HOME_BANNER_ERROR_MESSAGES = {
  NOT_FOUND: "홈 배너를 찾을 수 없습니다.",
  MAX_COUNT_EXCEEDED: "등록 가능한 최대 개수를 초과했습니다.",
  REORDER_IDS_MISMATCH: "순서 변경 대상이 올바르지 않습니다.",
  INVALID_DISPLAY_PERIOD: "노출 종료 시각은 시작 시각보다 이후여야 합니다.",
} as const;
