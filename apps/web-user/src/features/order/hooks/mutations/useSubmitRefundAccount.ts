import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orderApi } from "@/apps/web-user/features/order/apis/order.api";
import { orderQueryKeys } from "@/apps/web-user/features/order/constants/orderQueryKeys.constant";
import { useAlertStore } from "@/apps/web-user/common/store/alert.store";
import getApiMessage from "@/apps/web-user/common/utils/getApiMessage";
import { trackEvent } from "@/apps/web-user/common/utils/analytics.util";

/**
 * 이미 취소환불대기인 주문에 환불 계좌만 입력합니다.
 *
 * `useRequestRefund`(취소·환불 요청)와 달리 주문 상태를 바꾸지 않습니다. 관리자가 취소완료 주문을
 * 환불 처리로 되돌린 경우 환불 계좌가 비어 있어, 이 경로로 사용자가 직접 채웁니다.
 */
export function useSubmitRefundAccount() {
  const queryClient = useQueryClient();
  const { showAlert } = useAlertStore();

  return useMutation({
    mutationFn: ({
      orderId,
      bankName,
      bankAccountNumber,
      accountHolderName,
    }: {
      orderId: string;
      bankName: string;
      bankAccountNumber: string;
      accountHolderName: string;
    }) =>
      orderApi.submitRefundAccount(orderId, {
        bankName,
        bankAccountNumber,
        accountHolderName,
      }),
    onSuccess: (_data, variables) => {
      trackEvent("success_refund_info", { reservation_id: variables.orderId });
      queryClient.invalidateQueries({ queryKey: orderQueryKeys.all });
    },
    onError: (error) => {
      showAlert({
        type: "error",
        title: "오류",
        message: getApiMessage.error(error),
      });
    },
  });
}
