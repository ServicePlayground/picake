import { useMutation, useQueryClient } from "@tanstack/react-query";
import { aiAssistantApi } from "@/apps/web-seller/features/ai-assistant/apis/ai-assistant.api";
import { aiAssistantQueryKeys } from "@/apps/web-seller/features/ai-assistant/constants/aiAssistantQueryKeys.constant";
import type {
  UpdateAiAssistantSettingsRequestDto,
  UpsertAiFaqRequestDto,
} from "@/apps/web-seller/features/ai-assistant/types/ai-assistant.dto";
import { useAlertStore } from "@/apps/web-seller/common/store/alert.store";
import getApiMessage from "@/apps/web-seller/common/utils/getApiMessage";

export function useUpdateAiAssistantSettings(storeId: string) {
  const queryClient = useQueryClient();
  const { addAlert } = useAlertStore();

  return useMutation({
    mutationFn: (body: UpdateAiAssistantSettingsRequestDto) =>
      aiAssistantApi.updateSettings(storeId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiAssistantQueryKeys.settings(storeId) });
      addAlert({ severity: "success", message: "저장되었습니다." });
    },
    onError: (error) => {
      addAlert({ severity: "error", message: getApiMessage.error(error) });
    },
  });
}

/** 매장 정보로 지침 초안 생성 (저장하지 않고 텍스트만 반환) */
export function useGenerateInstructionsDraft(storeId: string) {
  const { addAlert } = useAlertStore();

  return useMutation({
    mutationFn: () => aiAssistantApi.generateInstructionsDraft(storeId),
    onError: (error) => {
      addAlert({ severity: "error", message: getApiMessage.error(error) });
    },
  });
}

/** 저장 전 미리테스트 */
export function useTestAiReply(storeId: string) {
  const { addAlert } = useAlertStore();

  return useMutation({
    mutationFn: (body: { question: string; instructions?: string }) =>
      aiAssistantApi.testReply(storeId, body),
    onError: (error) => {
      addAlert({ severity: "error", message: getApiMessage.error(error) });
    },
  });
}

export function useCreateAiFaq(storeId: string) {
  const queryClient = useQueryClient();
  const { addAlert } = useAlertStore();

  return useMutation({
    mutationFn: (body: UpsertAiFaqRequestDto) => aiAssistantApi.createFaq(storeId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiAssistantQueryKeys.faqs(storeId) });
    },
    onError: (error) => {
      addAlert({ severity: "error", message: getApiMessage.error(error) });
    },
  });
}

export function useDeleteAiFaq(storeId: string) {
  const queryClient = useQueryClient();
  const { addAlert } = useAlertStore();

  return useMutation({
    mutationFn: (faqId: string) => aiAssistantApi.deleteFaq(storeId, faqId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiAssistantQueryKeys.faqs(storeId) });
    },
    onError: (error) => {
      addAlert({ severity: "error", message: getApiMessage.error(error) });
    },
  });
}

/** 미답변 질문을 FAQ로 등록 */
export function useConvertToFaq(storeId: string) {
  const queryClient = useQueryClient();
  const { addAlert } = useAlertStore();

  return useMutation({
    mutationFn: ({ questionId, answer }: { questionId: string; answer?: string }) =>
      aiAssistantApi.convertToFaq(storeId, questionId, answer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiAssistantQueryKeys.faqs(storeId) });
      queryClient.invalidateQueries({
        queryKey: aiAssistantQueryKeys.unansweredQuestions(storeId),
      });
      addAlert({ severity: "success", message: "FAQ로 등록되었습니다." });
    },
    onError: (error) => {
      addAlert({ severity: "error", message: getApiMessage.error(error) });
    },
  });
}

export function useDismissUnansweredQuestion(storeId: string) {
  const queryClient = useQueryClient();
  const { addAlert } = useAlertStore();

  return useMutation({
    mutationFn: (questionId: string) =>
      aiAssistantApi.dismissUnansweredQuestion(storeId, questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: aiAssistantQueryKeys.unansweredQuestions(storeId),
      });
    },
    onError: (error) => {
      addAlert({ severity: "error", message: getApiMessage.error(error) });
    },
  });
}

/** 응대중 토글 — 이 방만 AI on/off */
export function useToggleRoomAi() {
  const { addAlert } = useAlertStore();

  return useMutation({
    mutationFn: ({ roomId, enabled }: { roomId: string; enabled: boolean }) =>
      aiAssistantApi.toggleRoomAi(roomId, enabled),
    onError: (error) => {
      addAlert({ severity: "error", message: getApiMessage.error(error) });
    },
  });
}
