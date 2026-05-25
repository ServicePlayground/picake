import { useQuery } from "@tanstack/react-query";
import { useQueryErrorAlert } from "@/apps/web-user/common/hooks/useQueryErrorAlert";
import { noticeApi } from "@/apps/web-user/features/notice/apis/notice.api";
import { noticeQueryKeys } from "@/apps/web-user/features/notice/constants/noticeQueryKeys.constant";
import type { Notice } from "@/apps/web-user/features/notice/types/notice.type";

// 공지사항 목록 조회
export function useNotices() {
  const query = useQuery<Notice[]>({
    queryKey: noticeQueryKeys.list(),
    queryFn: async () => {
      const response = await noticeApi.getNotices();
      return response.data;
    },
  });

  useQueryErrorAlert(query);

  return query;
}
