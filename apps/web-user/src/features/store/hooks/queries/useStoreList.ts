import { useInfiniteQuery } from "@tanstack/react-query";
import { storeApi } from "@/apps/web-user/features/store/apis/store.api";
import { storeQueryKeys } from "@/apps/web-user/features/store/constants/storeQueryKeys.constant";
import {
  StoreListResponse,
  StoreListFilter,
} from "@/apps/web-user/features/store/types/store.type";
import { useQueryErrorAlert } from "@/apps/web-user/common/hooks/useQueryErrorAlert";

export function useStoreList({
  search,
  limit = 20,
  sizes,
  minPrice,
  maxPrice,
  productCategoryTypes,
  sortBy,
}: { search?: string; limit?: number; sortBy?: string } & StoreListFilter = {}) {
  const query = useInfiniteQuery<StoreListResponse>({
    queryKey: storeQueryKeys.list({
      search,
      sizes,
      minPrice,
      maxPrice,
      productCategoryTypes,
      sortBy,
    }),
    queryFn: ({ pageParam = 1 }) =>
      storeApi.getList({
        search,
        page: pageParam as number,
        limit,
        sizes,
        minPrice,
        maxPrice,
        productCategoryTypes,
        sortBy,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNext ? lastPage.meta.currentPage + 1 : undefined,
    initialPageParam: 1,
    enabled: !!search?.trim(),
  });

  useQueryErrorAlert(query);

  return query;
}
