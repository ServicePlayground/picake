/**
 * 판매자 세그먼트 관리 관련 쿼리 키 상수
 */
export const sellerSegmentManagementQueryKeys = {
  all: ["seller-segment-management"] as const,
  segments: () => [...sellerSegmentManagementQueryKeys.all, "segments"] as const,
} as const;
