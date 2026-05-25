/**
 * 관리자 가입 설정 API 타입 (백엔드 admin-management config DTO와 정합)
 */

export interface AdminConfigResponseDto {
  requireApproval: boolean;
  updatedAt: string;
}

export interface UpdateAdminConfigRequestDto {
  requireApproval: boolean;
}
