import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminManagementApi } from "@/apps/web-admin/features/admin-management/apis/admin-management.api";
import { adminManagementQueryKeys } from "@/apps/web-admin/features/admin-management/constants/adminManagementQueryKeys.constant";
import { useAlertStore } from "@/apps/web-admin/common/store/alert.store";
import getApiMessage from "@/apps/web-admin/common/utils/getApiMessage";
import {
  AdminApprovalStatus,
  type AdminAccountItemResponseDto,
  type UpdateAdminApprovalRequestDto,
} from "@/apps/web-admin/features/admin-management/types/admin-management-account.dto";
import type {
  AdminConfigResponseDto,
  UpdateAdminConfigRequestDto,
} from "@/apps/web-admin/features/admin-management/types/admin-management-config.dto";

// 관리자 가입 설정 수정
export function useUpdateAdminManagementConfig() {
  const queryClient = useQueryClient();
  const { addAlert } = useAlertStore();

  return useMutation<AdminConfigResponseDto, Error, UpdateAdminConfigRequestDto>({
    mutationFn: (dto) => adminManagementApi.updateConfig(dto),
    onSuccess: (data) => {
      queryClient.setQueryData(adminManagementQueryKeys.config(), data);
      addAlert({
        severity: "success",
        message: "가입 설정이 저장되었습니다.",
      });
    },
    onError: (error) => {
      addAlert({
        severity: "error",
        message: getApiMessage.error(error),
      });
    },
  });
}

// 가입 신청 승인/거절
export function useUpdateAdminRegistrationApproval() {
  const queryClient = useQueryClient();
  const { addAlert } = useAlertStore();

  return useMutation<
    AdminAccountItemResponseDto,
    Error,
    { adminId: string; dto: UpdateAdminApprovalRequestDto }
  >({
    mutationFn: ({ adminId, dto }) => adminManagementApi.updateRegistrationApproval(adminId, dto),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: adminManagementQueryKeys.all });
      const label = variables.dto.approvalStatus === AdminApprovalStatus.APPROVED ? "승인" : "거절";
      addAlert({
        severity: "success",
        message: `가입 신청이 ${label}되었습니다.`,
      });
    },
    onError: (error) => {
      addAlert({
        severity: "error",
        message: getApiMessage.error(error),
      });
    },
  });
}
