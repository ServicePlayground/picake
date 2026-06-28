import { useQuery } from "@tanstack/react-query";
import { storeApi } from "@/apps/web-user/features/store/apis/store.api";
import { storeQueryKeys } from "@/apps/web-user/features/store/constants/storeQueryKeys.constant";

/**
 * 현재 사용자의 특정 카카오 장소 입점 요청 존재 여부 조회.
 * 로그인 상태이고 kakaoPlaceId가 있을 때만 조회한다.
 */
export function useStoreEntryRequestExists(kakaoPlaceId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: storeQueryKeys.entryRequestExists(kakaoPlaceId ?? ""),
    queryFn: () => storeApi.getEntryRequestExists(kakaoPlaceId as string),
    enabled: enabled && !!kakaoPlaceId,
  });
}
