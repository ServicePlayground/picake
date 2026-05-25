/**
 * 관리자 계정·가입 신청 API 타입 (백엔드 admin-management account DTO와 정합)
 * - 목록: AdminAccountListResponseDto (`ListResponseDto` 공통 래퍼)
 */
import type { ListResponseDto } from "@/apps/web-admin/common/types/api.dto";

export enum AdminApprovalStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface AdminAccountItemResponseDto {
  id: string;
  username: string;
  approvalStatus: AdminApprovalStatus;
  isActive: boolean;
  isTotpEnabled: boolean;
  approvedAt: string | null;
  rejectedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface AdminAccountListQueryDto {
  page?: number;
  limit?: number;
  approvalStatus?: AdminApprovalStatus;
}

export type AdminAccountListResponseDto = ListResponseDto<AdminAccountItemResponseDto>;

export interface UpdateAdminApprovalRequestDto {
  approvalStatus: AdminApprovalStatus.APPROVED | AdminApprovalStatus.REJECTED;
}
