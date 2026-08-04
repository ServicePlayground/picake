import { useQuery } from "@tanstack/react-query";
import { useQueryErrorAlert } from "@/apps/web-user/common/hooks/useQueryErrorAlert";
import { useRequireLogin } from "@/apps/web-user/common/hooks/useRequireLogin";
import { useAuthHasHydrated, useAuthStore } from "@/apps/web-user/common/store/auth.store";
import { orderApi } from "@/apps/web-user/features/order/apis/order.api";
import { orderQueryKeys } from "@/apps/web-user/features/order/constants/orderQueryKeys.constant";
import { OrderResponse } from "@/apps/web-user/features/order/types/order.type";

export function useOrderDetail(orderId: string) {
  const hasHydrated = useAuthHasHydrated();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const query = useQuery<OrderResponse>({
    queryKey: orderQueryKeys.detail(orderId),
    queryFn: () => orderApi.getOrderById(orderId),
    // 비로그인 상태로 요청하면 401 이 되므로 토큰 복원 후 로그인 상태에서만 조회
    enabled: hasHydrated && isAuthenticated && !!orderId,
  });

  useQueryErrorAlert(query);
  useRequireLogin(hasHydrated && !isAuthenticated);

  // 토큰 복원 전에는 로그인 여부를 알 수 없어 로딩으로 취급 (안내 문구 깜빡임 방지)
  return { ...query, isLoading: !hasHydrated || query.isLoading };
}
