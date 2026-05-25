import { useQuery } from "@tanstack/react-query";
import { useQueryErrorAlert } from "@/apps/web-user/common/hooks/useQueryErrorAlert";
import { qnaApi } from "@/apps/web-user/features/qna/apis/qna.api";
import { qnaQueryKeys } from "@/apps/web-user/features/qna/constants/qnaQueryKeys.constant";
import type { QnaCategory } from "@/apps/web-user/features/qna/types/qna.type";

// Q&A 카테고리별 목록 조회
export function useQnas() {
  const query = useQuery<QnaCategory[]>({
    queryKey: qnaQueryKeys.list(),
    queryFn: async () => {
      const response = await qnaApi.getQnas();
      return response.data;
    },
  });

  useQueryErrorAlert(query);

  return query;
}
