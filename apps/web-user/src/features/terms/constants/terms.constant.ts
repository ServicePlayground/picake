import type { TermsType } from "@/apps/web-user/features/terms/types/terms.dto";

export type { TermsType };

/** 회원가입 필수 동의 약관 */
export const CONSUMER_REQUIRED_TERMS_TYPES: TermsType[] = [
  "CONSUMER_TERMS_OF_SERVICE",
  "CONSUMER_PRIVACY_POLICY",
  "CONSUMER_THIRD_PARTY_CONSENT",
];

export const CONSUMER_TERMS_TYPES: TermsType[] = [
  ...CONSUMER_REQUIRED_TERMS_TYPES,
  "CONSUMER_LOCATION_TERMS",
];

/** 약관 HTML 렌더링용 루트 클래스 (web-admin · web-seller 미리보기와 동일) */
export const TERMS_PREVIEW_CONTENT_CLASS = "terms-preview-content";
