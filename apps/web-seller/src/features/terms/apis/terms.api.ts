import { sellerClient } from "@/apps/web-seller/common/config/axios.config";
import type {
  TermsDocumentResponseDto,
  TermsType,
} from "@/apps/web-seller/features/terms/types/terms.dto";

export type { TermsType, TermsDocumentResponseDto };

export const termsApi = {
  /** 현재 활성 약관 조회 (HTML content 포함) */
  getActiveTerms: async (type: TermsType): Promise<TermsDocumentResponseDto> => {
    const response = await sellerClient.get<{ data: TermsDocumentResponseDto }>(`/terms/${type}`);
    return response.data.data;
  },
};
