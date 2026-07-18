/**
 * 회원(구매자·판매자) 관리 상수
 */
export const MEMBER_MANAGEMENT_ERROR_MESSAGES = {
  CONSUMER_NOT_FOUND: "해당 구매자를 찾을 수 없습니다.",
  SELLER_NOT_FOUND: "해당 판매자를 찾을 수 없습니다.",
  MEMBER_WITHDRAWN: "탈퇴한 회원의 계정 상태는 변경할 수 없습니다.",
} as const;

/**
 * 회원 상태 필터 (DB 컬럼 조합으로 판정)
 * - ACTIVE: 활성 (`is_active` = true, 미탈퇴)
 * - INACTIVE: 비활성 (`is_active` = false, 미탈퇴)
 * - WITHDRAWN: 탈퇴 (`withdrawn_at` 존재)
 */
export const MEMBER_STATUS_FILTER_VALUES = ["ACTIVE", "INACTIVE", "WITHDRAWN"] as const;

export type MemberStatusFilter = (typeof MEMBER_STATUS_FILTER_VALUES)[number];

/** 목록 응답에 노출하는 Consumer 필드 */
export const MEMBER_CONSUMER_SELECT = {
  id: true,
  phone: true,
  name: true,
  nickname: true,
  isPhoneVerified: true,
  isActive: true,
  withdrawReason: true,
  withdrawnAt: true,
  googleEmail: true,
  kakaoEmail: true,
  createdAt: true,
  lastLoginAt: true,
  _count: { select: { orders: true } },
} as const;

/** 목록 응답에 노출하는 Seller 필드 */
export const MEMBER_SELLER_SELECT = {
  id: true,
  phone: true,
  name: true,
  nickname: true,
  isPhoneVerified: true,
  isActive: true,
  withdrawReason: true,
  withdrawnAt: true,
  googleEmail: true,
  kakaoEmail: true,
  sellerVerificationStatus: true,
  createdAt: true,
  lastLoginAt: true,
  stores: { select: { id: true, name: true } },
} as const;
