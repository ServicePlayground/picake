import { adminClient } from "@/apps/web-admin/common/config/axios.config";
import type {
  StoreManagementDetailResponseDto,
  StoreManagementListQueryDto,
  StoreManagementListResponseDto,
} from "@/apps/web-admin/features/store-management/types/store-management.dto";

export const storeManagementApi = {
  // 스토어 목록 조회
  getStores: async (
    params?: StoreManagementListQueryDto,
  ): Promise<StoreManagementListResponseDto> => {
    const response = await adminClient.get("/store-management/stores", { params });
    return response.data.data;
  },

  // 스토어 상세 조회
  getStore: async (storeId: string): Promise<StoreManagementDetailResponseDto> => {
    const response = await adminClient.get(`/store-management/stores/${storeId}`);
    return response.data.data;
  },
};
