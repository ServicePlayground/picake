import { useMutation, useQueryClient } from "@tanstack/react-query";
import { termsApi } from "@/apps/web-admin/features/terms/apis/terms.api";
import { termsQueryKeys } from "@/apps/web-admin/features/terms/constants/termsQueryKeys.constant";
import { useAlertStore } from "@/apps/web-admin/common/store/alert.store";
import getApiMessage from "@/apps/web-admin/common/utils/getApiMessage";
import type {
  CreateTermsDocumentRequestDto,
  TermsDocumentResponseDto,
} from "@/apps/web-admin/features/terms/types/terms.dto";

// 약관 등록 뮤테이션
export function useCreateTerms() {
  const queryClient = useQueryClient();
  const { addAlert } = useAlertStore();

  return useMutation<TermsDocumentResponseDto, Error, CreateTermsDocumentRequestDto>({
    mutationFn: (dto) => termsApi.create(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: termsQueryKeys.all });
      addAlert({ severity: "success", message: "약관이 등록되었습니다." });
    },
    onError: (error) => {
      addAlert({ severity: "error", message: getApiMessage.error(error) });
    },
  });
}

// 약관 활성화 뮤테이션
export function useActivateTerms() {
  const queryClient = useQueryClient();
  const { addAlert } = useAlertStore();

  return useMutation<TermsDocumentResponseDto, Error, string>({
    mutationFn: (id) => termsApi.activate(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: termsQueryKeys.all });
      addAlert({ severity: "success", message: "해당 버전이 활성화되었습니다." });
    },
    onError: (error) => {
      addAlert({ severity: "error", message: getApiMessage.error(error) });
    },
  });
}
