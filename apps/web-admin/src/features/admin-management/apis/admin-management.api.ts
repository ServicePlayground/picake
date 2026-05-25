import { adminClient } from "@/apps/web-admin/common/config/axios.config";
import type {
  AdminAccountItemResponseDto,
  AdminAccountListQueryDto,
  AdminAccountListResponseDto,
  UpdateAdminApprovalRequestDto,
} from "@/apps/web-admin/features/admin-management/types/admin-management-account.dto";
import type {
  AdminConfigResponseDto,
  UpdateAdminConfigRequestDto,
} from "@/apps/web-admin/features/admin-management/types/admin-management-config.dto";

export const adminManagementApi = {
  // 관리자 가입 설정 조회
  getConfig: async (): Promise<AdminConfigResponseDto> => {
    const response = await adminClient.get("/admin-management/config");
    return response.data.data;
  },

  // 관리자 가입 설정 수정
  updateConfig: async (dto: UpdateAdminConfigRequestDto): Promise<AdminConfigResponseDto> => {
    const response = await adminClient.patch("/admin-management/config", dto);
    return response.data.data;
  },

  // 가입 신청 내역 조회 (PENDING)
  getRegistrationRequests: async (
    params?: AdminAccountListQueryDto,
  ): Promise<AdminAccountListResponseDto> => {
    const response = await adminClient.get("/admin-management/requests", { params });
    return response.data.data;
  },

  // 가입 신청 승인/거절
  updateRegistrationApproval: async (
    adminId: string,
    dto: UpdateAdminApprovalRequestDto,
  ): Promise<AdminAccountItemResponseDto> => {
    const response = await adminClient.patch(`/admin-management/requests/${adminId}`, dto);
    return response.data.data;
  },

  // 관리자 계정 목록 조회
  getAccounts: async (params?: AdminAccountListQueryDto): Promise<AdminAccountListResponseDto> => {
    const response = await adminClient.get("/admin-management/accounts", { params });
    return response.data.data;
  },
};
