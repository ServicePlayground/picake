import { useMutation, useQueryClient } from "@tanstack/react-query";
import { noticeApi } from "@/apps/web-admin/features/notice/apis/notice.api";
import { noticeQueryKeys } from "@/apps/web-admin/features/notice/constants/noticeQueryKeys.constant";
import { useAlertStore } from "@/apps/web-admin/common/store/alert.store";
import getApiMessage from "@/apps/web-admin/common/utils/getApiMessage";
import type {
  CreateNoticeRequestDto,
  NoticeItemResponseDto,
  UpdateNoticeRequestDto,
} from "@/apps/web-admin/features/notice/types/notice.dto";

// 공지사항 등록 뮤테이션
export function useCreateNotice() {
  const queryClient = useQueryClient();
  const { addAlert } = useAlertStore();

  return useMutation<NoticeItemResponseDto, Error, CreateNoticeRequestDto>({
    mutationFn: (dto) => noticeApi.create(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: noticeQueryKeys.all });
      addAlert({ severity: "success", message: "공지사항이 등록되었습니다." });
    },
    onError: (error) => {
      addAlert({ severity: "error", message: getApiMessage.error(error) });
    },
  });
}

// 공지사항 수정 뮤테이션
export function useUpdateNotice() {
  const queryClient = useQueryClient();
  const { addAlert } = useAlertStore();

  return useMutation<NoticeItemResponseDto, Error, { id: string; dto: UpdateNoticeRequestDto }>({
    mutationFn: ({ id, dto }) => noticeApi.update(id, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: noticeQueryKeys.all });
      addAlert({ severity: "success", message: "저장되었습니다." });
    },
    onError: (error) => {
      addAlert({ severity: "error", message: getApiMessage.error(error) });
    },
  });
}

// 공지사항 삭제 뮤테이션
export function useDeleteNotice() {
  const queryClient = useQueryClient();
  const { addAlert } = useAlertStore();

  return useMutation({
    mutationFn: (id: string) => noticeApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: noticeQueryKeys.all });
      addAlert({ severity: "success", message: "공지사항이 삭제되었습니다." });
    },
    onError: (error) => {
      addAlert({ severity: "error", message: getApiMessage.error(error) });
    },
  });
}
