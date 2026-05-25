import type { TermsAgreementState } from "@/apps/web-user/features/auth/components/TermsAgreementSection";
import {
  CONSUMER_REQUIRED_TERMS_TYPES,
  CONSUMER_TERMS_TYPES,
} from "@/apps/web-user/features/terms/constants/terms.constant";
import type { TermsType } from "@/apps/web-user/features/terms/types/terms.dto";

/** 활성 약관 문서 맵 → 타입별 문서 ID 맵 */
export function mapConsumerActiveTermsToDocIds(
  docs: Partial<Record<TermsType, { id: string }>>,
): Partial<Record<TermsType, string>> {
  const ids: Partial<Record<TermsType, string>> = {};
  for (const type of CONSUMER_TERMS_TYPES) {
    const id = docs[type]?.id;
    if (id) ids[type] = id;
  }
  return ids;
}

/** 필수·선택 동의에 맞춰 활성 약관 문서 ID 목록 반환 (필수 ID 미로드 시 null) */
export function buildConsumerTermsDocumentIds(
  state: TermsAgreementState,
  activeIds: Partial<Record<TermsType, string>>,
): string[] | null {
  if (!state.termsOfService || !state.privacyPolicy || !state.thirdPartyConsent) {
    return null;
  }

  const ids: string[] = [];
  for (const type of CONSUMER_REQUIRED_TERMS_TYPES) {
    const id = activeIds[type];
    if (!id) return null;
    ids.push(id);
  }

  if (state.locationTerms) {
    const locationId = activeIds.CONSUMER_LOCATION_TERMS;
    if (locationId) ids.push(locationId);
  }

  return ids;
}
