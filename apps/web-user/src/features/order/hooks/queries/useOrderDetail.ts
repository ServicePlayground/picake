import { useQuery } from "@tanstack/react-query";
import { useQueryErrorAlert } from "@/apps/web-user/common/hooks/useQueryErrorAlert";
import { orderApi } from "@/apps/web-user/features/order/apis/order.api";
import { orderQueryKeys } from "@/apps/web-user/features/order/constants/orderQueryKeys.constant";
import { OrderResponse } from "@/apps/web-user/features/order/types/order.type";

export function useOrderDetail(orderId: string) {
  const query = useQuery<OrderResponse>({
    queryKey: orderQueryKeys.detail(orderId),
    queryFn: () => orderApi.getOrderById(orderId),
    enabled: !!orderId,
  });

  useQueryErrorAlert(query);

  return query;
}
