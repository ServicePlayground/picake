import { consumerClient } from "@/apps/web-user/common/config/axios.config";
import type { HomeBannerListResponse } from "@/apps/web-user/features/home-banner/types/home-banner.type";

export const homeBannerApi = {
  // 홈 배너 목록 조회
  getHomeBanners: async (): Promise<HomeBannerListResponse> => {
    const response = await consumerClient.get("/home-banners");
    return response.data.data;
  },
};
