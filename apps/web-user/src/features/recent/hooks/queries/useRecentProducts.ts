import { useInfiniteQuery } from "@tanstack/react-query";
import { recentApi, RecentProductsResponse } from "@/apps/web-user/features/recent/apis/recent.api";
import { recentQueryKeys } from "@/apps/web-user/features/recent/constants/recentQueryKeys.constant";
import { useQueryErrorAlert } from "@/apps/web-user/common/hooks/useQueryErrorAlert";

export function useRecentProducts({ limit = 20 }: { limit?: number } = {}) {
  const query = useInfiniteQuery<RecentProductsResponse>({
    queryKey: recentQueryKeys.recentProducts(),
    queryFn: ({ pageParam = 1 }) =>
      recentApi.getRecentProducts({ page: pageParam as number, limit }),
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNext ? lastPage.meta.currentPage + 1 : undefined,
    initialPageParam: 1,
  });

  useQueryErrorAlert(query);

  return query;
}
