import { useQuery } from "@tanstack/react-query";
import { homeBannerApi } from "@/apps/web-admin/features/home-banner/apis/home-banner.api";
import { homeBannerQueryKeys } from "@/apps/web-admin/features/home-banner/constants/homeBannerQueryKeys.constant";
import type { HomeBannerListResponseDto } from "@/apps/web-admin/features/home-banner/types/home-banner.dto";

// 홈 배너 목록 조회
export function useHomeBannerList() {
  return useQuery<HomeBannerListResponseDto>({
    queryKey: homeBannerQueryKeys.list(),
    queryFn: () => homeBannerApi.getList(),
  });
}
