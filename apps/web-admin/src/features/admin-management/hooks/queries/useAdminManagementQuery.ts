import { useQuery } from "@tanstack/react-query";
import { adminManagementApi } from "@/apps/web-admin/features/admin-management/apis/admin-management.api";
import { adminManagementQueryKeys } from "@/apps/web-admin/features/admin-management/constants/adminManagementQueryKeys.constant";
import type {
  AdminAccountListQueryDto,
  AdminAccountListResponseDto,
} from "@/apps/web-admin/features/admin-management/types/admin-management-account.dto";
import type { AdminConfigResponseDto } from "@/apps/web-admin/features/admin-management/types/admin-management-config.dto";

// 관리자 가입 설정 조회
export function useAdminManagementConfig() {
  return useQuery<AdminConfigResponseDto>({
    queryKey: adminManagementQueryKeys.config(),
    queryFn: () => adminManagementApi.getConfig(),
  });
}

// 가입 신청 내역(PENDING) 목록 조회
export function useAdminRegistrationRequestList(params: AdminAccountListQueryDto) {
  return useQuery<AdminAccountListResponseDto>({
    queryKey: adminManagementQueryKeys.requestList(params),
    queryFn: () => adminManagementApi.getRegistrationRequests(params),
  });
}

// 관리자 계정 목록 조회
export function useAdminAccountList(params: AdminAccountListQueryDto) {
  return useQuery<AdminAccountListResponseDto>({
    queryKey: adminManagementQueryKeys.accountList(params),
    queryFn: () => adminManagementApi.getAccounts(params),
  });
}
