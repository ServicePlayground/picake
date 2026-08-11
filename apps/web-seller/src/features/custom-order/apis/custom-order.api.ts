import { sellerClient } from "@/apps/web-seller/common/config/axios.config";
import type {
  CustomOrderRequestResponseDto,
  QuoteCustomOrderRequestDto,
} from "@/apps/web-seller/features/custom-order/types/custom-order.dto";

export const customOrderApi = {
  /** 스토어의 맞춤 주문 요청 목록 */
  listForStore: async (
    storeId: string,
    status?: string,
  ): Promise<CustomOrderRequestResponseDto[]> => {
    const response = await sellerClient.get(`/store/${storeId}/custom-order-requests`, {
      params: status ? { status } : undefined,
    });
    return response.data.data;
  },

  /** 요청 단건 조회 (채팅 카드 렌더링) */
  getById: async (requestId: string): Promise<CustomOrderRequestResponseDto> => {
    const response = await sellerClient.get(`/custom-order-requests/${requestId}`);
    return response.data.data;
  },

  /** 견적 제시 (1회) */
  quote: async (
    requestId: string,
    body: QuoteCustomOrderRequestDto,
  ): Promise<{ id: string; status: string; quotedPrice: number }> => {
    const response = await sellerClient.patch(`/custom-order-requests/${requestId}/quote`, body);
    return response.data.data;
  },
};
