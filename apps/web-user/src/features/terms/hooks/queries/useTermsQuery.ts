import { useQuery } from "@tanstack/react-query";
import { useQueryErrorAlert } from "@/apps/web-user/common/hooks/useQueryErrorAlert";
import { termsApi } from "@/apps/web-user/features/terms/apis/terms.api";
import { CONSUMER_TERMS_TYPES } from "@/apps/web-user/features/terms/constants/terms.constant";
import { termsQueryKeys } from "@/apps/web-user/features/terms/constants/termsQueryKeys.constant";
import type {
  TermsDocumentResponseDto,
  TermsType,
} from "@/apps/web-user/features/terms/types/terms.dto";

/** 타입별 현재 활성 약관 조회 */
export function useActiveTerms(type: TermsType) {
  const query = useQuery<TermsDocumentResponseDto>({
    queryKey: termsQueryKeys.active(type),
    queryFn: () => termsApi.getActiveTerms(type),
  });

  useQueryErrorAlert(query);

  return query;
}

/** 회원가입 등 — 소비자 전체 약관 타입의 활성 문서 일괄 조회 */
export function useConsumerActiveTerms() {
  const query = useQuery<Record<TermsType, TermsDocumentResponseDto>>({
    queryKey: termsQueryKeys.consumerActive(),
    queryFn: async () => {
      const docs = await Promise.all(
        CONSUMER_TERMS_TYPES.map((type) => termsApi.getActiveTerms(type)),
      );
      return Object.fromEntries(
        CONSUMER_TERMS_TYPES.map((type, index) => [type, docs[index]]),
      ) as Record<TermsType, TermsDocumentResponseDto>;
    },
  });

  useQueryErrorAlert(query);

  return query;
}
