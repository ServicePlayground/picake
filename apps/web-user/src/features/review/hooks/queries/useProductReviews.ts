import { useQuery } from "@tanstack/react-query";
import { useQueryErrorAlert } from "@/apps/web-user/common/hooks/useQueryErrorAlert";
import { reviewApi } from "@/apps/web-user/features/review/apis/review.api";
import { reviewQueryKeys } from "@/apps/web-user/features/review/constants/reviewQueryKeys.constant";
import {
  ReviewListResponse,
  ReviewSortBy,
} from "@/apps/web-user/features/review/types/review.type";

interface UseProductReviewsParams {
  productId: string;
  page?: number;
  limit?: number;
  sortBy?: ReviewSortBy;
}

export function useProductReviews({
  productId,
  page = 1,
  limit = 20,
  sortBy = ReviewSortBy.LATEST,
}: UseProductReviewsParams) {
  const query = useQuery<ReviewListResponse>({
    queryKey: reviewQueryKeys.productReviews(productId, page, limit, sortBy),
    queryFn: () => reviewApi.getProductReviews({ productId, page, limit, sortBy }),
    enabled: !!productId,
  });

  useQueryErrorAlert(query);

  return query;
}
