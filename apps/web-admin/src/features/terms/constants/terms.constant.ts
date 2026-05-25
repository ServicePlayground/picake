import type { TermsType } from "@/apps/web-admin/features/terms/types/terms.dto";

export const TERMS_TYPE_LABEL: Record<TermsType, string> = {
  CONSUMER_TERMS_OF_SERVICE: "서비스 이용약관",
  CONSUMER_PRIVACY_POLICY: "개인정보 처리방침",
  CONSUMER_THIRD_PARTY_CONSENT: "개인정보 제3자 제공 동의",
  CONSUMER_LOCATION_TERMS: "위치기반서비스 이용약관",
  SELLER_TERMS_OF_SERVICE: "서비스 이용약관",
  SELLER_PRIVACY_POLICY: "개인정보 처리방침",
};

export const CONSUMER_TERMS_TYPES: TermsType[] = [
  "CONSUMER_TERMS_OF_SERVICE",
  "CONSUMER_PRIVACY_POLICY",
  "CONSUMER_THIRD_PARTY_CONSENT",
  "CONSUMER_LOCATION_TERMS",
];

export const SELLER_TERMS_TYPES: TermsType[] = ["SELLER_TERMS_OF_SERVICE", "SELLER_PRIVACY_POLICY"];

/** 약관 HTML 미리보기/렌더링용 루트 클래스 */
export const TERMS_PREVIEW_CONTENT_CLASS = "terms-preview-content";
