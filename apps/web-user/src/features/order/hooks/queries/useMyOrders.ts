import { useInfiniteQuery } from "@tanstack/react-query";
import { useQueryErrorAlert } from "@/apps/web-user/common/hooks/useQueryErrorAlert";
import { useAuthStore } from "@/apps/web-user/common/store/auth.store";
import { orderApi } from "@/apps/web-user/features/order/apis/order.api";
import { orderQueryKeys } from "@/apps/web-user/features/order/constants/orderQueryKeys.constant";
import { MyOrdersResponse } from "@/apps/web-user/features/order/types/order.type";

const DEFAULT_LIMIT = 10;

export function useMyOrders(params?: { type?: "UPCOMING" | "PAST"; limit?: number }) {
  const { isAuthenticated } = useAuthStore();
  const limit = params?.limit ?? DEFAULT_LIMIT;

  const query = useInfiniteQuery<MyOrdersResponse>({
    queryKey: orderQueryKeys.mypage(params?.type),
    queryFn: ({ pageParam = 1 }) =>
      orderApi.getMyOrders({ type: params?.type, page: pageParam as number, limit }),
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNext ? lastPage.meta.currentPage + 1 : undefined,
    initialPageParam: 1,
    enabled: isAuthenticated,
  });

  useQueryErrorAlert(query);

  return query;
}
