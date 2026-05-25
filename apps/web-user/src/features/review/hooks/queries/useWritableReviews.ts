import { useQuery } from "@tanstack/react-query";
import { useQueryErrorAlert } from "@/apps/web-user/common/hooks/useQueryErrorAlert";
import { useAuthStore } from "@/apps/web-user/common/store/auth.store";
import { reviewApi } from "@/apps/web-user/features/review/apis/review.api";
import { reviewQueryKeys } from "@/apps/web-user/features/review/constants/reviewQueryKeys.constant";
import { WritableReviewListResponse } from "@/apps/web-user/features/review/types/review.type";

interface UseWritableReviewsParams {
  page?: number;
  limit?: number;
}

export function useWritableReviews({ page = 1, limit = 20 }: UseWritableReviewsParams = {}) {
  const { isAuthenticated } = useAuthStore();

  const query = useQuery<WritableReviewListResponse>({
    queryKey: reviewQueryKeys.writableReviews(page, limit),
    queryFn: () => reviewApi.getWritableReviews({ page, limit }),
    enabled: isAuthenticated,
  });

  useQueryErrorAlert(query);

  return query;
}
