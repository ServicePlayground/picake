import { consumerClient } from "@/apps/web-user/common/config/axios.config";
import type { QnaGroupedListResponse } from "@/apps/web-user/features/qna/types/qna.type";

export const qnaApi = {
  // Q&A 목록 조회 (카테고리별 그룹, 활성화된 항목만)
  getQnas: async (): Promise<QnaGroupedListResponse> => {
    const response = await consumerClient.get("/qnas");
    return response.data.data;
  },
};
