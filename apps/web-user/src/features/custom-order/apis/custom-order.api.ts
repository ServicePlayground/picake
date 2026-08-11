import { consumerClient } from "@/apps/web-user/common/config/axios.config";
import type {
  CustomOrderRequest,
  CreateCustomOrderRequest,
  CreateCustomOrderResponse,
} from "@/apps/web-user/features/custom-order/types/custom-order.type";

export const customOrderApi = {
  /** 맞춤 주문 요청 생성 — 성공 시 해당 채팅방으로 이동 */
  create: async (request: CreateCustomOrderRequest): Promise<CreateCustomOrderResponse> => {
    const response = await consumerClient.post("/custom-order-requests", request);
    return response.data.data;
  },

  /** 요청 단건 조회 (채팅 카드 렌더링) */
  getById: async (requestId: string): Promise<CustomOrderRequest> => {
    const response = await consumerClient.get(`/custom-order-requests/${requestId}`);
    return response.data.data;
  },

  /** 견적 승인 — 입금대기 주문 생성 + 입금 안내 알림톡 발송 */
  accept: async (requestId: string): Promise<{ orderId: string; status: string }> => {
    const response = await consumerClient.post(`/custom-order-requests/${requestId}/accept`);
    return response.data.data;
  },

  /** 견적 거절 */
  decline: async (requestId: string): Promise<{ id: string; status: string }> => {
    const response = await consumerClient.post(`/custom-order-requests/${requestId}/decline`);
    return response.data.data;
  },
};
