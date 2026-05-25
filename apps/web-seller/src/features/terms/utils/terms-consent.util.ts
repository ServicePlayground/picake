import type { SellerTermsAgreementState } from "@/apps/web-seller/features/auth/components/SellerTermsAgreementSection";
import { SELLER_TERMS_TYPES } from "@/apps/web-seller/features/terms/constants/terms.constant";
import type { TermsType } from "@/apps/web-seller/features/terms/types/terms.dto";

/** 활성 약관 문서 맵 → 타입별 문서 ID 맵 */
export function mapSellerActiveTermsToDocIds(
  docs: Partial<Record<TermsType, { id: string }>>,
): Partial<Record<TermsType, string>> {
  const ids: Partial<Record<TermsType, string>> = {};
  for (const type of SELLER_TERMS_TYPES) {
    const id = docs[type]?.id;
    if (id) ids[type] = id;
  }
  return ids;
}

/** 활성 약관 문서 ID가 모두 로드되었는지 확인 후 동의 문서 ID 목록 반환 */
export function buildSellerTermsDocumentIds(
  state: SellerTermsAgreementState,
  activeIds: Partial<Record<TermsType, string>>,
): string[] | null {
  if (!state.termsOfService || !state.privacyPolicy) return null;

  const ids = SELLER_TERMS_TYPES.map((type) => activeIds[type]).filter(
    (id): id is string => typeof id === "string",
  );

  if (ids.length !== SELLER_TERMS_TYPES.length) return null;
  return ids;
}
