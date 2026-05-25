import { useInfiniteQuery } from "@tanstack/react-query";
import { likeApi, LikedStoresResponse } from "@/apps/web-user/features/like/apis/like.api";
import { likeQueryKeys } from "@/apps/web-user/features/like/constants/likeQueryKeys.constant";
import { useQueryErrorAlert } from "@/apps/web-user/common/hooks/useQueryErrorAlert";

export function useLikedStores({ limit = 20 }: { limit?: number } = {}) {
  const query = useInfiniteQuery<LikedStoresResponse>({
    queryKey: likeQueryKeys.likedStores(),
    queryFn: ({ pageParam = 1 }) =>
      likeApi.getLikedStores({ page: pageParam as number, limit, sortBy: "latest" }),
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNext ? lastPage.meta.currentPage + 1 : undefined,
    initialPageParam: 1,
  });

  useQueryErrorAlert(query);

  return query;
}
