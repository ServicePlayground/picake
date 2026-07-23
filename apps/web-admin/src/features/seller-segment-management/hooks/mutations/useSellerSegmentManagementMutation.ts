import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/apps/web-admin/common/store/alert.store";
import getApiMessage from "@/apps/web-admin/common/utils/getApiMessage";
import { sellerSegmentManagementApi } from "@/apps/web-admin/features/seller-segment-management/apis/seller-segment-management.api";
import { sellerSegmentManagementQueryKeys } from "@/apps/web-admin/features/seller-segment-management/constants/sellerSegmentManagementQueryKeys.constant";
import type {
  AutoAssignBySignupDateRequestDto,
  AutoAssignResultResponseDto,
  CreateSellerSegmentRequestDto,
  SellerSegmentResponseDto,
} from "@/apps/web-admin/features/seller-segment-management/types/seller-segment-management.dto";

// 세그먼트 등록
export function useCreateSellerSegment() {
  const queryClient = useQueryClient();
  const { addAlert } = useAlertStore();

  return useMutation<SellerSegmentResponseDto, Error, CreateSellerSegmentRequestDto>({
    mutationFn: (dto) => sellerSegmentManagementApi.createSegment(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: sellerSegmentManagementQueryKeys.segments() });
      addAlert({ severity: "success", message: "세그먼트가 등록되었습니다." });
    },
    onError: (error) => {
      addAlert({ severity: "error", message: getApiMessage.error(error) });
    },
  });
}

// 가입일 기준 자동 편입
export function useAutoAssignBySignupDate() {
  const queryClient = useQueryClient();
  const { addAlert } = useAlertStore();

  return useMutation<
    AutoAssignResultResponseDto,
    Error,
    { id: string; dto: AutoAssignBySignupDateRequestDto }
  >({
    mutationFn: ({ id, dto }) => sellerSegmentManagementApi.autoAssignBySignupDate(id, dto),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: sellerSegmentManagementQueryKeys.segments() });
      addAlert({
        severity: "success",
        message: `${result.addedCount}명 새로 편입되었습니다. (대상 ${result.totalEligible}명 중 기존 ${result.alreadyMemberCount}명 제외)`,
      });
    },
    onError: (error) => {
      addAlert({ severity: "error", message: getApiMessage.error(error) });
    },
  });
}
