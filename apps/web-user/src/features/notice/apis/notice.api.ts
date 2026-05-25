import { consumerClient } from "@/apps/web-user/common/config/axios.config";
import type { NoticeListResponse } from "@/apps/web-user/features/notice/types/notice.type";

export const noticeApi = {
  // 공지사항 목록 조회 (활성화된 항목만, 핀 고정 우선)
  getNotices: async (): Promise<NoticeListResponse> => {
    const response = await consumerClient.get("/notices");
    return response.data.data;
  },
};
