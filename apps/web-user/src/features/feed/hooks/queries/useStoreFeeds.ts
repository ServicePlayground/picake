import { useQuery } from "@tanstack/react-query";
import { useQueryErrorAlert } from "@/apps/web-user/common/hooks/useQueryErrorAlert";
import { feedApi } from "@/apps/web-user/features/feed/apis/feed.api";
import { feedQueryKeys } from "@/apps/web-user/features/feed/constants/feedQueryKeys.constant";
import { FeedListResponse } from "@/apps/web-user/features/feed/types/feed.type";

interface UseStoreFeedsParams {
  storeId: string;
  page?: number;
  limit?: number;
}

export function useStoreFeeds({ storeId, page = 1, limit = 20 }: UseStoreFeedsParams) {
  const query = useQuery<FeedListResponse>({
    queryKey: feedQueryKeys.storeFeeds(storeId, page, limit),
    queryFn: () => feedApi.getStoreFeeds({ storeId, page, limit }),
    enabled: !!storeId,
  });

  useQueryErrorAlert(query);

  return query;
}
