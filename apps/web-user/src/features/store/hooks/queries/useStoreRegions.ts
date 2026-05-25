import { useQuery } from "@tanstack/react-query";
import { useQueryErrorAlert } from "@/apps/web-user/common/hooks/useQueryErrorAlert";
import { storeApi } from "@/apps/web-user/features/store/apis/store.api";

export function useStoreRegions() {
  const query = useQuery({
    queryKey: ["store", "regions"],
    queryFn: storeApi.getRegions,
  });

  useQueryErrorAlert(query);

  return query;
}
