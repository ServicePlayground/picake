import { consumerClient } from "@/apps/web-user/common/config/axios.config";
import type {
  TermsDocumentResponseDto,
  TermsType,
} from "@/apps/web-user/features/terms/types/terms.dto";

export type { TermsType, TermsDocumentResponseDto };

export const termsApi = {
  /** 현재 활성 약관 조회 (HTML content 포함) */
  getActiveTerms: async (type: TermsType): Promise<TermsDocumentResponseDto> => {
    const response = await consumerClient.get<{ data: TermsDocumentResponseDto }>(`/terms/${type}`);
    return response.data.data;
  },
};
