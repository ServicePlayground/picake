/**
 * 판매자 세그먼트 관리 DTO (백엔드 seller-segment.dto와 동일 구조)
 *
 * "오픈 초기 가입 판매자"처럼 향후 혜택을 줄 대상을 미리 구분해두기 위한 기능입니다.
 * 혜택의 종류·인원·기간은 여기서 다루지 않고, 세그먼트 소속 여부만 관리합니다.
 */

/** 세그먼트 항목 */
export interface SellerSegmentResponseDto {
  id: string;
  key: string;
  label: string;
  memberCount: number;
  createdAt: string;
}

export type SellerSegmentListResponseDto = { data: SellerSegmentResponseDto[] };

/** 세그먼트 등록 요청 */
export interface CreateSellerSegmentRequestDto {
  key: string;
  label: string;
}

/** 가입일 기준 자동 편입 요청 */
export interface AutoAssignBySignupDateRequestDto {
  /** 이 시각 이전(포함) 가입한 판매자를 편입 (ISO 8601) */
  cutoffDate: string;
}

export interface AutoAssignResultResponseDto {
  addedCount: number;
  alreadyMemberCount: number;
  totalEligible: number;
}
