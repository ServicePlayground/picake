import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orderApi } from "@/apps/web-user/features/order/apis/order.api";
import { orderQueryKeys } from "@/apps/web-user/features/order/constants/orderQueryKeys.constant";
import { useAlertStore } from "@/apps/web-user/common/store/alert.store";
import getApiMessage from "@/apps/web-user/common/utils/getApiMessage";
import { trackEvent } from "@/apps/web-user/common/utils/analytics.util";

export function useCancelBeforePayment() {
  const queryClient = useQueryClient();
  const { showAlert } = useAlertStore();

  return useMutation({
    mutationFn: ({
      orderId,
      reason,
      deposited,
    }: {
      orderId: string;
      reason: string;
      /** 이미 입금했다고 신고하는 경우의 환불 계좌. 있으면 취소환불대기로 전환됩니다. */
      deposited?: {
        bankName: string;
        bankAccountNumber: string;
        accountHolderName: string;
      };
    }) => orderApi.cancelBeforePayment(orderId, reason, deposited),
    onSuccess: (_data, variables) => {
      trackEvent("success_cancel_reservation", { reservation_id: variables.orderId });
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
