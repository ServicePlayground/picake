import { useInfiniteQuery } from "@tanstack/react-query";
import { likeApi, LikedProductsResponse } from "@/apps/web-user/features/like/apis/like.api";
import { likeQueryKeys } from "@/apps/web-user/features/like/constants/likeQueryKeys.constant";
import { useQueryErrorAlert } from "@/apps/web-user/common/hooks/useQueryErrorAlert";

export function useLikedProducts({ limit = 20 }: { limit?: number } = {}) {
  const query = useInfiniteQuery<LikedProductsResponse>({
    queryKey: likeQueryKeys.likedProducts(),
    queryFn: ({ pageParam = 1 }) =>
      likeApi.getLikedProducts({ page: pageParam as number, limit, sortBy: "latest" }),
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNext ? lastPage.meta.currentPage + 1 : undefined,
    initialPageParam: 1,
  });

  useQueryErrorAlert(query);

  return query;
}
