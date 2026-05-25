/**
 * AdminConfig 싱글톤 Row ID
 */
export const ADMIN_CONFIG_ID = "default";

/**
 * 관리자 계정 관리 에러 메시지
 */
export const ADMIN_MANAGEMENT_ERROR_MESSAGES = {
  ADMIN_NOT_FOUND: "해당 관리자 계정을 찾을 수 없습니다.",
  APPROVAL_ALREADY_PROCESSED:
    "이미 처리된 신청입니다. PENDING 상태인 계정만 승인/거절할 수 있습니다.",
} as const;

/** 승인/거절 처리에 허용되는 상태값 (PENDING 제외) */
export const ADMIN_APPROVAL_ACTION_VALUES = ["APPROVED", "REJECTED"] as const;

export type AdminApprovalAction = (typeof ADMIN_APPROVAL_ACTION_VALUES)[number];

/** 목록·상세 응답에 노출하는 Admin 필드 */
export const ADMIN_ACCOUNT_SELECT = {
  id: true,
  username: true,
  approvalStatus: true,
  isActive: true,
  isTotpEnabled: true,
  approvedAt: true,
  rejectedAt: true,
  lastLoginAt: true,
  createdAt: true,
} as const;
