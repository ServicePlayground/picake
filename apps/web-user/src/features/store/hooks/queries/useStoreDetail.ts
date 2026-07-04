import { useQuery } from "@tanstack/react-query";
import { QUERY_STALE_TIME } from "@/apps/web-user/common/constants/query-cache.constants";
import { useQueryErrorAlert } from "@/apps/web-user/common/hooks/useQueryErrorAlert";
import { storeApi } from "@/apps/web-user/features/store/apis/store.api";
import { storeQueryKeys } from "@/apps/web-user/features/store/constants/storeQueryKeys.constant";
import { StoreInfo } from "@/apps/web-user/features/store/types/store.type";

export function useStoreDetail(storeId: string) {
  const query = useQuery<StoreInfo>({
    queryKey: storeQueryKeys.detail(storeId),
    queryFn: () => storeApi.getDetail(storeId),
    enabled: !!storeId,
    staleTime: QUERY_STALE_TIME.DETAIL,
  });

  useQueryErrorAlert(query);

  return query;
}
