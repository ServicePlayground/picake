import { useQuery } from "@tanstack/react-query";
import { aiAssistantApi } from "@/apps/web-seller/features/ai-assistant/apis/ai-assistant.api";
import { aiAssistantQueryKeys } from "@/apps/web-seller/features/ai-assistant/constants/aiAssistantQueryKeys.constant";

export function useAiAssistantSettings(storeId: string) {
  return useQuery({
    queryKey: aiAssistantQueryKeys.settings(storeId),
    queryFn: () => aiAssistantApi.getSettings(storeId),
    enabled: Boolean(storeId),
  });
}

export function useAiFaqs(storeId: string) {
  return useQuery({
    queryKey: aiAssistantQueryKeys.faqs(storeId),
    queryFn: () => aiAssistantApi.getFaqs(storeId),
    enabled: Boolean(storeId),
  });
}

export function useAiUnansweredQuestions(storeId: string) {
  return useQuery({
    queryKey: aiAssistantQueryKeys.unansweredQuestions(storeId),
    queryFn: () => aiAssistantApi.getUnansweredQuestions(storeId),
    enabled: Boolean(storeId),
  });
}

export function useAiStats(storeId: string, days = 7) {
  return useQuery({
    queryKey: aiAssistantQueryKeys.stats(storeId, days),
    queryFn: () => aiAssistantApi.getStats(storeId, days),
    enabled: Boolean(storeId),
  });
}
