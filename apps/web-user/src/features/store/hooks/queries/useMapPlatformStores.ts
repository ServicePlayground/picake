import { useQuery } from "@tanstack/react-query";
import { QUERY_STALE_TIME } from "@/apps/web-user/common/constants/query-cache.constants";
import { storeApi } from "@/apps/web-user/features/store/apis/store.api";
import { storeQueryKeys } from "@/apps/web-user/features/store/constants/storeQueryKeys.constant";
import type { StoreInfo, StoreListFilter } from "@/apps/web-user/features/store/types/store.type";
import {
  filterStoresWithCoordinates,
  mapPickupFilterToStoreListQuery,
  type MapPickupFilter,
} from "@/apps/web-user/features/store/utils/map.util";

/**
 * 지도 페이지 — 플랫폼 입점 스토어 전체 조회 (좌표 있는 스토어만).
 * React Query 캐시로 지도 탭 재진입 시 마커를 즉시 표시하고, stale이면 백그라운드에서 갱신합니다.
 * 지도는 조회 실패 시에도 화면을 유지해야 하므로 에러 알림은 띄우지 않습니다.
 */
export function useMapPlatformStores({
  listFilter,
  pickupFilter,
}: {
  listFilter: StoreListFilter;
  pickupFilter: MapPickupFilter | null;
}) {
  const filterParams: StoreListFilter = {};
  if (listFilter.sizes?.length) filterParams.sizes = listFilter.sizes;
  if (listFilter.minPrice != null) filterParams.minPrice = listFilter.minPrice;
  if (listFilter.maxPrice != null) filterParams.maxPrice = listFilter.maxPrice;
  if (listFilter.productCategoryTypes?.length)
    filterParams.productCategoryTypes = listFilter.productCategoryTypes;
  const pickupQ = mapPickupFilterToStoreListQuery(pickupFilter);
  const params = { ...filterParams, ...(pickupQ ?? {}) };

  return useQuery({
    queryKey: storeQueryKeys.mapAll(params),
    queryFn: async () => {
      const list: StoreInfo[] = [];
      let page = 1;
      const limit = 1000;
      let hasNext = true;
      while (hasNext) {
        const res = await storeApi.getList({ page, limit, ...params });
        list.push(...res.data);
        hasNext = res.meta.hasNext;
        page += 1;
      }
      return filterStoresWithCoordinates(list);
    },
    staleTime: QUERY_STALE_TIME.DEFAULT,
  });
}
