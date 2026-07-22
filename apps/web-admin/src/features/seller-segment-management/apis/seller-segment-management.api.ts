import { adminClient } from "@/apps/web-admin/common/config/axios.config";
import type {
  AutoAssignBySignupDateRequestDto,
  AutoAssignResultResponseDto,
  CreateSellerSegmentRequestDto,
  SellerSegmentListResponseDto,
  SellerSegmentResponseDto,
} from "@/apps/web-admin/features/seller-segment-management/types/seller-segment-management.dto";

const BASE = "/seller-segment-management/segments";

export const sellerSegmentManagementApi = {
  // 세그먼트 목록 조회
  getSegments: async (): Promise<SellerSegmentListResponseDto> => {
    const response = await adminClient.get(BASE);
    return response.data.data;
  },

  // 세그먼트 등록
  createSegment: async (dto: CreateSellerSegmentRequestDto): Promise<SellerSegmentResponseDto> => {
    const response = await adminClient.post(BASE, dto);
    return response.data.data;
  },

  // 가입일 기준 자동 편입
  autoAssignBySignupDate: async (
    id: string,
    dto: AutoAssignBySignupDateRequestDto,
  ): Promise<AutoAssignResultResponseDto> => {
    const response = await adminClient.post(`${BASE}/${id}/auto-assign-by-signup-date`, dto);
    return response.data.data;
  },
};
