import { sellerClient } from "@/apps/web-seller/common/config/axios.config";
import type {
  AiAssistantSettingsResponseDto,
  UpdateAiAssistantSettingsRequestDto,
  AiFaqResponseDto,
  UpsertAiFaqRequestDto,
  AiUnansweredQuestionResponseDto,
  AiPreviewTestResponseDto,
  AiInstructionsDraftResponseDto,
  AiStatsResponseDto,
} from "@/apps/web-seller/features/ai-assistant/types/ai-assistant.dto";

const basePath = (storeId: string) => `/store/${storeId}/ai-assistant`;

export const aiAssistantApi = {
  getSettings: async (storeId: string): Promise<AiAssistantSettingsResponseDto> => {
    const response = await sellerClient.get(`${basePath(storeId)}/settings`);
    return response.data.data;
  },

  updateSettings: async (
    storeId: string,
    body: UpdateAiAssistantSettingsRequestDto,
  ): Promise<AiAssistantSettingsResponseDto> => {
    const response = await sellerClient.put(`${basePath(storeId)}/settings`, body);
    return response.data.data;
  },

  /** 매장 정보로 지침 초안 생성 (저장하지 않음) */
  generateInstructionsDraft: async (
    storeId: string,
  ): Promise<AiInstructionsDraftResponseDto> => {
    const response = await sellerClient.post(`${basePath(storeId)}/instructions-draft`);
    return response.data.data;
  },

  /** 저장 전 미리테스트 (실제 채팅방·기록 영향 없음) */
  testReply: async (
    storeId: string,
    body: { question: string; instructions?: string },
  ): Promise<AiPreviewTestResponseDto> => {
    const response = await sellerClient.post(`${basePath(storeId)}/test`, body);
    return response.data.data;
  },

  getFaqs: async (storeId: string): Promise<AiFaqResponseDto[]> => {
    const response = await sellerClient.get(`${basePath(storeId)}/faqs`);
    return response.data.data;
  },

  createFaq: async (storeId: string, body: UpsertAiFaqRequestDto): Promise<AiFaqResponseDto> => {
    const response = await sellerClient.post(`${basePath(storeId)}/faqs`, body);
    return response.data.data;
  },

  updateFaq: async (
    storeId: string,
    faqId: string,
    body: Partial<UpsertAiFaqRequestDto>,
  ): Promise<AiFaqResponseDto> => {
    const response = await sellerClient.patch(`${basePath(storeId)}/faqs/${faqId}`, body);
    return response.data.data;
  },

  deleteFaq: async (storeId: string, faqId: string): Promise<{ success: boolean }> => {
    const response = await sellerClient.delete(`${basePath(storeId)}/faqs/${faqId}`);
    return response.data.data;
  },

  getUnansweredQuestions: async (
    storeId: string,
  ): Promise<AiUnansweredQuestionResponseDto[]> => {
    const response = await sellerClient.get(`${basePath(storeId)}/unanswered-questions`);
    return response.data.data;
  },

  convertToFaq: async (
    storeId: string,
    questionId: string,
    answer?: string,
  ): Promise<AiFaqResponseDto> => {
    const response = await sellerClient.post(
      `${basePath(storeId)}/unanswered-questions/${questionId}/convert-to-faq`,
      { answer },
    );
    return response.data.data;
  },

  dismissUnansweredQuestion: async (
    storeId: string,
    questionId: string,
  ): Promise<{ success: boolean }> => {
    const response = await sellerClient.post(
      `${basePath(storeId)}/unanswered-questions/${questionId}/dismiss`,
    );
    return response.data.data;
  },

  getStats: async (storeId: string, days = 7): Promise<AiStatsResponseDto> => {
    const response = await sellerClient.get(`${basePath(storeId)}/stats`, { params: { days } });
    return response.data.data;
  },

  /** 응대중 토글 — 이 방만 AI on/off */
  toggleRoomAi: async (roomId: string, enabled: boolean): Promise<{ aiEnabled: boolean }> => {
    const response = await sellerClient.patch(`/chat-room/${roomId}/ai-toggle`, { enabled });
    return response.data.data;
  },
};
