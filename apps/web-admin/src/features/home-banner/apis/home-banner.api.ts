import { adminClient } from "@/apps/web-admin/common/config/axios.config";
import type {
  CreateHomeBannerRequestDto,
  HomeBannerItemResponseDto,
  HomeBannerListResponseDto,
  ReorderHomeBannerRequestDto,
  UpdateHomeBannerRequestDto,
} from "@/apps/web-admin/features/home-banner/types/home-banner.dto";

export const homeBannerApi = {
  // 홈 배너 목록 조회
  getList: async (): Promise<HomeBannerListResponseDto> => {
    const response = await adminClient.get("/home-banners");
    return response.data.data;
  },

  // 홈 배너 등록
  create: async (dto: CreateHomeBannerRequestDto): Promise<HomeBannerItemResponseDto> => {
    const response = await adminClient.post("/home-banners", dto);
    return response.data.data;
  },

  // 홈 배너 수정
  update: async (
    id: string,
    dto: UpdateHomeBannerRequestDto,
  ): Promise<HomeBannerItemResponseDto> => {
    const response = await adminClient.patch(`/home-banners/${id}`, dto);
    return response.data.data;
  },

  // 홈 배너 삭제
  remove: async (id: string): Promise<void> => {
    await adminClient.delete(`/home-banners/${id}`);
  },

  // 홈 배너 순서 변경
  reorder: async (dto: ReorderHomeBannerRequestDto): Promise<void> => {
    await adminClient.patch("/home-banners/reorder", dto);
  },
};
