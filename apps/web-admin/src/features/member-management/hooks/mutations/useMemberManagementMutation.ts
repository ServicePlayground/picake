import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/apps/web-admin/common/store/alert.store";
import getApiMessage from "@/apps/web-admin/common/utils/getApiMessage";
import { memberManagementApi } from "@/apps/web-admin/features/member-management/apis/member-management.api";
import { memberManagementQueryKeys } from "@/apps/web-admin/features/member-management/constants/memberManagementQueryKeys.constant";
import type {
  MemberConsumerItemResponseDto,
  MemberSellerItemResponseDto,
  UpdateMemberActiveRequestDto,
} from "@/apps/web-admin/features/member-management/types/member-management.dto";

// 구매자 계정 활성/비활성 변경
export function useUpdateMemberConsumerActive() {
  const queryClient = useQueryClient();
  const { addAlert } = useAlertStore();

  return useMutation<
    MemberConsumerItemResponseDto,
    Error,
    { consumerId: string; dto: UpdateMemberActiveRequestDto }
  >({
    mutationFn: ({ consumerId, dto }) => memberManagementApi.updateConsumerActive(consumerId, dto),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: memberManagementQueryKeys.consumers() });
      addAlert({
        severity: "success",
        message: `구매자 계정이 ${variables.dto.isActive ? "활성" : "비활성"} 처리되었습니다.`,
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

// 판매자 계정 활성/비활성 변경
export function useUpdateMemberSellerActive() {
  const queryClient = useQueryClient();
  const { addAlert } = useAlertStore();

  return useMutation<
    MemberSellerItemResponseDto,
    Error,
    { sellerId: string; dto: UpdateMemberActiveRequestDto }
  >({
    mutationFn: ({ sellerId, dto }) => memberManagementApi.updateSellerActive(sellerId, dto),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: memberManagementQueryKeys.sellers() });
      addAlert({
        severity: "success",
        message: `판매자 계정이 ${variables.dto.isActive ? "활성" : "비활성"} 처리되었습니다.`,
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
