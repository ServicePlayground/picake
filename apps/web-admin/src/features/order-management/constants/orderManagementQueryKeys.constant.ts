import type { AdminRefundCandidateListQueryDto } from "@/apps/web-admin/features/order-management/types/order-management.dto";

/**
 * 주문 관리 관련 쿼리 키 상수
 */
export const orderManagementQueryKeys = {
  all: ["order-management"] as const,
  refundCandidates: () => [...orderManagementQueryKeys.all, "refund-candidates"] as const,
  refundCandidateList: (params: AdminRefundCandidateListQueryDto) =>
    [...orderManagementQueryKeys.refundCandidates(), params] as const,
  orders: () => [...orderManagementQueryKeys.all, "orders"] as const,
  orderDetail: (orderId: string) => [...orderManagementQueryKeys.orders(), orderId] as const,
} as const;
