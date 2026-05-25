/**
 * GET `/v1/seller/store/:storeId/home`. 스토어별 대시보드 쿼리 키 분리.
 */
import { useQuery } from "@tanstack/react-query";
import { useQueryErrorAlert } from "@/apps/web-seller/common/hooks/useQueryErrorAlert";
import { sellerHomeApi } from "@/apps/web-seller/features/home/apis/home.api";
import { sellerHomeQueryKeys } from "@/apps/web-seller/features/home/constants/sellerHomeQueryKeys.constant";
import type { SellerHomeDashboardDto } from "@/apps/web-seller/features/home/types/seller-home.dto";

export function useStoreHomeDashboardQuery(storeId: string) {
  const query = useQuery<SellerHomeDashboardDto>({
    queryKey: sellerHomeQueryKeys.dashboard(storeId),
    queryFn: () => sellerHomeApi.getDashboard(storeId),
    enabled: !!storeId,
  });

  useQueryErrorAlert(query);

  return query;
}
