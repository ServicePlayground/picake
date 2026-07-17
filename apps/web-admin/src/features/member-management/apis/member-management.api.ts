import { adminClient } from "@/apps/web-admin/common/config/axios.config";
import type {
  MemberConsumerItemResponseDto,
  MemberConsumerListQueryDto,
  MemberConsumerListResponseDto,
  MemberSellerItemResponseDto,
  MemberSellerListQueryDto,
  MemberSellerListResponseDto,
  UpdateMemberActiveRequestDto,
} from "@/apps/web-admin/features/member-management/types/member-management.dto";

export const memberManagementApi = {
  // 구매자 목록 조회
  getConsumers: async (
    params?: MemberConsumerListQueryDto,
  ): Promise<MemberConsumerListResponseDto> => {
    const response = await adminClient.get("/member-management/consumers", { params });
    return response.data.data;
  },

  // 구매자 계정 활성/비활성 변경
  updateConsumerActive: async (
    consumerId: string,
    dto: UpdateMemberActiveRequestDto,
  ): Promise<MemberConsumerItemResponseDto> => {
    const response = await adminClient.patch(
      `/member-management/consumers/${consumerId}/active`,
      dto,
    );
    return response.data.data;
  },

  // 판매자 목록 조회
  getSellers: async (params?: MemberSellerListQueryDto): Promise<MemberSellerListResponseDto> => {
    const response = await adminClient.get("/member-management/sellers", { params });
    return response.data.data;
  },

  // 판매자 계정 활성/비활성 변경
  updateSellerActive: async (
    sellerId: string,
    dto: UpdateMemberActiveRequestDto,
  ): Promise<MemberSellerItemResponseDto> => {
    const response = await adminClient.patch(`/member-management/sellers/${sellerId}/active`, dto);
    return response.data.data;
  },
};
