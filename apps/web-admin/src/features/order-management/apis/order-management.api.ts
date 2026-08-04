import { adminClient } from "@/apps/web-admin/common/config/axios.config";
import type {
  AdminOrderResponseDto,
  AdminRefundCandidateListQueryDto,
  AdminRefundCandidateListResponseDto,
  AdminRevertToRefundPendingRequestDto,
} from "@/apps/web-admin/features/order-management/types/order-management.dto";

export const orderManagementApi = {
  // 환불 구제 대상(취소완료) 주문 목록 조회
  getRefundCandidates: async (
    params: AdminRefundCandidateListQueryDto,
  ): Promise<AdminRefundCandidateListResponseDto> => {
    const response = await adminClient.get("/order-management/refund-candidates", { params });
    return response.data.data;
  },

  // 주문 상세 조회
  getOrder: async (orderId: string): Promise<AdminOrderResponseDto> => {
    const response = await adminClient.get(`/order-management/orders/${orderId}`);
    return response.data.data;
  },

  // 취소완료 → 취소환불대기 되돌리기
  revertToRefundPending: async (
    orderId: string,
    dto: AdminRevertToRefundPendingRequestDto,
  ): Promise<{ id: string }> => {
    const response = await adminClient.patch(
      `/order-management/orders/${orderId}/revert-to-refund-pending`,
      dto,
    );
    return response.data.data;
  },
};
