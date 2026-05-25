import { useInfiniteQuery } from "@tanstack/react-query";
import { useQueryErrorAlert } from "@/apps/web-user/common/hooks/useQueryErrorAlert";
import { reviewApi } from "@/apps/web-user/features/review/apis/review.api";
import { reviewQueryKeys } from "@/apps/web-user/features/review/constants/reviewQueryKeys.constant";
import {
  ReviewListResponse,
  ReviewSortBy,
} from "@/apps/web-user/features/review/types/review.type";

interface UseStoreReviewsParams {
  storeId: string;
  limit?: number;
  sortBy?: ReviewSortBy;
}

export function useStoreReviews({
  storeId,
  limit = 20,
  sortBy = ReviewSortBy.LATEST,
}: UseStoreReviewsParams) {
  const query = useInfiniteQuery<ReviewListResponse>({
    queryKey: reviewQueryKeys.storeReviews(storeId, 1, limit, sortBy),
    queryFn: ({ pageParam = 1 }) =>
      reviewApi.getStoreReviews({ storeId, page: pageParam as number, limit, sortBy }),
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.hasNext) {
        return lastPage.meta.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!storeId,
  });

  useQueryErrorAlert(query);

  return query;
}
