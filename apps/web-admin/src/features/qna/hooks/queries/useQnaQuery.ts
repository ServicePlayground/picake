import { useQuery } from "@tanstack/react-query";
import { useQueryErrorAlert } from "@/apps/web-admin/common/hooks/useQueryErrorAlert";
import { qnaApi } from "@/apps/web-admin/features/qna/apis/qna.api";
import { qnaQueryKeys } from "@/apps/web-admin/features/qna/constants/qnaQueryKeys.constant";
import type { QnaListResponseDto } from "@/apps/web-admin/features/qna/types/qna.dto";

// Q&A 목록 조회
export function useQnaList() {
  const query = useQuery<QnaListResponseDto>({
    queryKey: qnaQueryKeys.list(),
    queryFn: () => qnaApi.getList(),
  });

  useQueryErrorAlert(query);

  return query;
}
