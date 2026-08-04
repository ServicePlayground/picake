import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useQueryErrorAlert } from "@/apps/web-admin/common/hooks/useQueryErrorAlert";
import { orderManagementApi } from "@/apps/web-admin/features/order-management/apis/order-management.api";
import { orderManagementQueryKeys } from "@/apps/web-admin/features/order-management/constants/orderManagementQueryKeys.constant";
import type {
  AdminRefundCandidateListQueryDto,
  AdminRefundCandidateListResponseDto,
} from "@/apps/web-admin/features/order-management/types/order-management.dto";

// 환불 구제 대상(취소완료) 주문 목록 조회
export function useRefundCandidateList(params: AdminRefundCandidateListQueryDto) {
  const query = useQuery<AdminRefundCandidateListResponseDto>({
    queryKey: orderManagementQueryKeys.refundCandidateList(params),
    queryFn: () => orderManagementApi.getRefundCandidates(params),
    placeholderData: keepPreviousData,
  });

  useQueryErrorAlert(query);

  return query;
}
