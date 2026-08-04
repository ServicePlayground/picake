import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/apps/web-admin/common/store/alert.store";
import getApiMessage from "@/apps/web-admin/common/utils/getApiMessage";
import { orderManagementApi } from "@/apps/web-admin/features/order-management/apis/order-management.api";
import { orderManagementQueryKeys } from "@/apps/web-admin/features/order-management/constants/orderManagementQueryKeys.constant";
import type { AdminRevertToRefundPendingRequestDto } from "@/apps/web-admin/features/order-management/types/order-management.dto";

/**
 * 취소완료 주문을 취소환불대기로 되돌리기.
 * 성공 시 구매자·판매자 모두에게 알림이 발송되고, 구매자가 환불 계좌를 입력할 차례가 됩니다.
 */
export function useRevertOrderToRefundPending() {
  const queryClient = useQueryClient();
  const { addAlert } = useAlertStore();

  return useMutation<
    { id: string },
    Error,
    { orderId: string; dto: AdminRevertToRefundPendingRequestDto }
  >({
    mutationFn: ({ orderId, dto }) => orderManagementApi.revertToRefundPending(orderId, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: orderManagementQueryKeys.all });
      addAlert({
        severity: "success",
        message: "환불 처리로 되돌렸습니다. 구매자에게 환불 계좌 입력 안내가 발송됩니다.",
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
