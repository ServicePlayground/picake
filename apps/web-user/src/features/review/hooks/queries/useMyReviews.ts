import { useQuery } from "@tanstack/react-query";
import { useQueryErrorAlert } from "@/apps/web-user/common/hooks/useQueryErrorAlert";
import { useAuthStore } from "@/apps/web-user/common/store/auth.store";
import { reviewApi } from "@/apps/web-user/features/review/apis/review.api";
import { reviewQueryKeys } from "@/apps/web-user/features/review/constants/reviewQueryKeys.constant";
import {
  MyReviewListResponse,
  ReviewSortBy,
} from "@/apps/web-user/features/review/types/review.type";

interface UseMyReviewsParams {
  page?: number;
  limit?: number;
  sortBy?: ReviewSortBy;
}

export function useMyReviews({
  page = 1,
  limit = 20,
  sortBy = ReviewSortBy.LATEST,
}: UseMyReviewsParams = {}) {
  const { isAuthenticated } = useAuthStore();

  const query = useQuery<MyReviewListResponse>({
    queryKey: reviewQueryKeys.myReviews(page, limit, sortBy),
    queryFn: () => reviewApi.getMyReviews({ page, limit, sortBy }),
    enabled: isAuthenticated,
  });

  useQueryErrorAlert(query);

  return query;
}
