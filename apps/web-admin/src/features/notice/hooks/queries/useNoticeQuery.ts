import { useQuery } from "@tanstack/react-query";
import { useQueryErrorAlert } from "@/apps/web-admin/common/hooks/useQueryErrorAlert";
import { noticeApi } from "@/apps/web-admin/features/notice/apis/notice.api";
import { noticeQueryKeys } from "@/apps/web-admin/features/notice/constants/noticeQueryKeys.constant";
import type { NoticeListResponseDto } from "@/apps/web-admin/features/notice/types/notice.dto";

// 공지사항 목록 조회
export function useNoticeList() {
  const query = useQuery<NoticeListResponseDto>({
    queryKey: noticeQueryKeys.list(),
    queryFn: () => noticeApi.getList(),
  });

  useQueryErrorAlert(query);

  return query;
}
