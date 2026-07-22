export const SELLER_SEGMENT_ERROR_MESSAGES = {
  SEGMENT_NOT_FOUND: "해당 세그먼트를 찾을 수 없습니다.",
  KEY_DUPLICATE: "이미 존재하는 세그먼트 키입니다.",
} as const;

/** 세그먼트 목록/상세 응답에 사용하는 필드 */
export const SELLER_SEGMENT_SELECT = {
  id: true,
  key: true,
  label: true,
  createdAt: true,
  _count: { select: { memberships: true } },
} as const;
