import { useQuery } from "@tanstack/react-query";
import { homeBannerApi } from "@/apps/web-user/features/home-banner/apis/home-banner.api";
import { homeBannerQueryKeys } from "@/apps/web-user/features/home-banner/constants/homeBannerQueryKeys.constant";
import type { HomeBanner } from "@/apps/web-user/features/home-banner/types/home-banner.type";

// 홈 배너 목록 조회
export function useHomeBanners() {
  return useQuery<HomeBanner[]>({
    queryKey: homeBannerQueryKeys.list(),
    queryFn: async () => {
      const response = await homeBannerApi.getHomeBanners();
      return response.data;
    },
    staleTime: 60_000, // 1분 캐시
  });
}
