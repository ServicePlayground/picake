import { useQuery } from "@tanstack/react-query";
import { QUERY_STALE_TIME } from "@/apps/web-user/common/constants/query-cache.constants";
import { useQueryErrorAlert } from "@/apps/web-user/common/hooks/useQueryErrorAlert";
import { storeApi } from "@/apps/web-user/features/store/apis/store.api";

export function useStoreRegions() {
  const query = useQuery({
    queryKey: ["store", "regions"],
    queryFn: storeApi.getRegions,
    staleTime: QUERY_STALE_TIME.STATIC,
  });

  useQueryErrorAlert(query);

  return query;
}
