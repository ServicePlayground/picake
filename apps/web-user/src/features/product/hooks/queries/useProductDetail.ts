import { useQuery } from "@tanstack/react-query";
import { QUERY_STALE_TIME } from "@/apps/web-user/common/constants/query-cache.constants";
import { useQueryErrorAlert } from "@/apps/web-user/common/hooks/useQueryErrorAlert";
import { productApi } from "@/apps/web-user/features/product/apis/product.api";
import { productQueryKeys } from "@/apps/web-user/features/product/constants/productQueryKeys.constant";
import { Product } from "@/apps/web-user/features/product/types/product.type";

export function useProductDetail(productId: string) {
  const query = useQuery<Product>({
    queryKey: productQueryKeys.detail(productId),
    queryFn: () => productApi.getProductDetail(productId),
    enabled: !!productId,
    staleTime: QUERY_STALE_TIME.DETAIL,
  });

  useQueryErrorAlert(query);

  return query;
}
