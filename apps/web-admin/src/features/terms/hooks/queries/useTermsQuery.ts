import { useQuery } from "@tanstack/react-query";
import { useQueryErrorAlert } from "@/apps/web-admin/common/hooks/useQueryErrorAlert";
import { termsApi } from "@/apps/web-admin/features/terms/apis/terms.api";
import { termsQueryKeys } from "@/apps/web-admin/features/terms/constants/termsQueryKeys.constant";
import type {
  TermsActiveMapResponseDto,
  TermsDocumentResponseDto,
  TermsType,
  TermsVersionListResponseDto,
} from "@/apps/web-admin/features/terms/types/terms.dto";

// 모든 타입별 활성 버전 목록 조회
export function useTermsActiveList() {
  const query = useQuery<TermsActiveMapResponseDto>({
    queryKey: termsQueryKeys.activeList(),
    queryFn: () => termsApi.getActiveList(),
  });

  useQueryErrorAlert(query);

  return query;
}

// 특정 타입의 버전 이력 조회
export function useTermsVersionList(type: TermsType) {
  const query = useQuery<TermsVersionListResponseDto>({
    queryKey: termsQueryKeys.versionList(type),
    queryFn: () => termsApi.getVersionList(type),
  });

  useQueryErrorAlert(query);

  return query;
}

// 약관 상세 조회
export function useTermsDetail(id: string | null) {
  const query = useQuery<TermsDocumentResponseDto>({
    queryKey: termsQueryKeys.detail(id ?? ""),
    queryFn: () => termsApi.getById(id!),
    enabled: !!id,
  });

  useQueryErrorAlert(query);

  return query;
}
