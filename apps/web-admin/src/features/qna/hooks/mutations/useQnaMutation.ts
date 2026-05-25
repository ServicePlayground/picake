import { useMutation, useQueryClient } from "@tanstack/react-query";
import { qnaApi } from "@/apps/web-admin/features/qna/apis/qna.api";
import { qnaQueryKeys } from "@/apps/web-admin/features/qna/constants/qnaQueryKeys.constant";
import { useAlertStore } from "@/apps/web-admin/common/store/alert.store";
import getApiMessage from "@/apps/web-admin/common/utils/getApiMessage";
import type {
  CreateQnaRequestDto,
  QnaItemResponseDto,
  UpdateQnaRequestDto,
} from "@/apps/web-admin/features/qna/types/qna.dto";

// Q&A 등록 뮤테이션
export function useCreateQna() {
  const queryClient = useQueryClient();
  const { addAlert } = useAlertStore();

  return useMutation<QnaItemResponseDto, Error, CreateQnaRequestDto>({
    mutationFn: (dto) => qnaApi.create(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qnaQueryKeys.all });
      addAlert({ severity: "success", message: "Q&A가 등록되었습니다." });
    },
    onError: (error) => {
      addAlert({ severity: "error", message: getApiMessage.error(error) });
    },
  });
}

// Q&A 수정 뮤테이션
export function useUpdateQna() {
  const queryClient = useQueryClient();
  const { addAlert } = useAlertStore();

  return useMutation<QnaItemResponseDto, Error, { id: string; dto: UpdateQnaRequestDto }>({
    mutationFn: ({ id, dto }) => qnaApi.update(id, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qnaQueryKeys.all });
      addAlert({ severity: "success", message: "저장되었습니다." });
    },
    onError: (error) => {
      addAlert({ severity: "error", message: getApiMessage.error(error) });
    },
  });
}

// Q&A 삭제 뮤테이션
export function useDeleteQna() {
  const queryClient = useQueryClient();
  const { addAlert } = useAlertStore();

  return useMutation({
    mutationFn: (id: string) => qnaApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qnaQueryKeys.all });
      addAlert({ severity: "success", message: "Q&A가 삭제되었습니다." });
    },
    onError: (error) => {
      addAlert({ severity: "error", message: getApiMessage.error(error) });
    },
  });
}
