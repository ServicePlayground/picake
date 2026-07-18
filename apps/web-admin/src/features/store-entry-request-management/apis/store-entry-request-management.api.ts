import { adminClient } from "@/apps/web-admin/common/config/axios.config";
import type {
  StoreEntryRequestItemResponseDto,
  StoreEntryRequestListQueryDto,
  StoreEntryRequestListResponseDto,
} from "@/apps/web-admin/features/store-entry-request-management/types/store-entry-request-management.dto";

export const storeEntryRequestManagementApi = {
  // 입점 요청 목록 조회
  getRequests: async (
    params?: StoreEntryRequestListQueryDto,
  ): Promise<StoreEntryRequestListResponseDto> => {
    const response = await adminClient.get("/store-entry-request-management/requests", {
      params,
    });
    return response.data.data;
  },

  // 입점 요청 상세 조회
  getRequest: async (requestId: string): Promise<StoreEntryRequestItemResponseDto> => {
    const response = await adminClient.get(`/store-entry-request-management/requests/${requestId}`);
    return response.data.data;
  },
};
