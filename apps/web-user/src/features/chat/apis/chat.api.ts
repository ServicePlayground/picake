import { consumerClient } from "@/apps/web-user/common/config/axios.config";
import {
  ChatRoomListResponse,
  CreateChatRoomRequest,
  CreateChatRoomResponse,
  MessageListResponse,
  GetMessagesRequest,
  GetChatRoomsRequest,
  Message,
} from "@/apps/web-user/features/chat/types/chat.type";

export const chatApi = {
  // 채팅방 목록 조회 (무한 스크롤)
  getChatRooms: async (params: GetChatRoomsRequest): Promise<ChatRoomListResponse> => {
    const response = await consumerClient.get("/chat-room", { params });
    return response.data.data;
  },

  // 채팅방 생성 또는 조회
  createOrGetChatRoom: async (request: CreateChatRoomRequest): Promise<CreateChatRoomResponse> => {
    const response = await consumerClient.post("/chat-room", request);
    return response.data.data;
  },

  // 메시지 목록 조회 (무한 스크롤)
  getMessages: async (roomId: string, params: GetMessagesRequest): Promise<MessageListResponse> => {
    const response = await consumerClient.get(`/chat-room/${roomId}/messages`, { params });
    return response.data.data;
  },

  // 채팅방 읽음 처리
  markChatRoomAsRead: async (roomId: string): Promise<{ success: boolean }> => {
    const response = await consumerClient.post(`/chat-room/${roomId}/read`);
    return response.data.data;
  },

  /**
   * 메시지 전송 (REST) — 상품 상세에서 시작된 문의의 첫 메시지에 productId를 붙일 때 사용.
   * 일반 대화는 WebSocket 경로를 그대로 사용합니다.
   */
  sendMessage: async (roomId: string, text: string, productId?: string): Promise<Message> => {
    const response = await consumerClient.post(`/chat-room/${roomId}/messages`, {
      text,
      productId,
    });
    return response.data.data;
  },

  /** 사장님 연결 요청 (AI가 모른다고 답했을 때의 quick-reply) */
  requestHuman: async (roomId: string): Promise<{ success: boolean }> => {
    const response = await consumerClient.post(`/chat-room/${roomId}/request-human`);
    return response.data.data;
  },

  /** AI 답변 피드백 (👍/👎) */
  setMessageFeedback: async (
    roomId: string,
    messageId: string,
    rating: "positive" | "negative",
  ): Promise<{ success: boolean }> => {
    const response = await consumerClient.post(
      `/chat-room/${roomId}/messages/${messageId}/feedback`,
      { rating },
    );
    return response.data.data;
  },
};
