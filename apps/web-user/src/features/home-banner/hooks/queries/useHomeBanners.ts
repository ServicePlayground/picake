import { useQuery } from "@tanstack/react-query";
import { useQueryErrorAlert } from "@/apps/web-user/common/hooks/useQueryErrorAlert";
import { homeBannerApi } from "@/apps/web-user/features/home-banner/apis/home-banner.api";
import { homeBannerQueryKeys } from "@/apps/web-user/features/home-banner/constants/homeBannerQueryKeys.constant";
import type { HomeBanner } from "@/apps/web-user/features/home-banner/types/home-banner.type";

// 홈 배너 목록 조회
export function useHomeBanners() {
  const query = useQuery<HomeBanner[]>({
    queryKey: homeBannerQueryKeys.list(),
    queryFn: async () => {
      const response = await homeBannerApi.getHomeBanners();
      return response.data;
    },
  });

  useQueryErrorAlert(query);

  return query;
}
