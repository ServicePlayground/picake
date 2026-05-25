import type { TermsType } from "@/apps/web-seller/features/terms/types/terms.dto";

export type { TermsType };

export const SELLER_TERMS_TYPES: TermsType[] = [
  "SELLER_TERMS_OF_SERVICE",
  "SELLER_PRIVACY_POLICY",
];

/** 약관 HTML 렌더링용 루트 클래스 (web-admin 미리보기와 동일 토큰) */
export const TERMS_PREVIEW_CONTENT_CLASS = "terms-preview-content";
