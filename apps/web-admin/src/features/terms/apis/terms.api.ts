import { adminClient } from "@/apps/web-admin/common/config/axios.config";
import type {
  CreateTermsDocumentRequestDto,
  TermsActiveMapResponseDto,
  TermsDocumentResponseDto,
  TermsType,
  TermsVersionListResponseDto,
} from "@/apps/web-admin/features/terms/types/terms.dto";

export const termsApi = {
  // 모든 타입별 활성 버전 목록
  getActiveList: async (): Promise<TermsActiveMapResponseDto> => {
    const response = await adminClient.get("/terms");
    return response.data.data;
  },

  // 특정 타입의 버전 이력 목록
  getVersionList: async (type: TermsType): Promise<TermsVersionListResponseDto> => {
    const response = await adminClient.get("/terms/versions", { params: { type } });
    return response.data.data;
  },

  // 약관 상세 조회 (content 포함)
  getById: async (id: string): Promise<TermsDocumentResponseDto> => {
    const response = await adminClient.get(`/terms/${id}`);
    return response.data.data;
  },

  // 새 약관 버전 등록
  create: async (dto: CreateTermsDocumentRequestDto): Promise<TermsDocumentResponseDto> => {
    const response = await adminClient.post("/terms", dto);
    return response.data.data;
  },

  // 특정 버전 활성화
  activate: async (id: string): Promise<TermsDocumentResponseDto> => {
    const response = await adminClient.patch(`/terms/${id}/activate`);
    return response.data.data;
  },
};
