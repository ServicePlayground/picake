/**
 * 약관 API 타입 — 백엔드 `TermsDocumentResponseDto`와 정합
 * Base: `GET /v1/seller/terms/:type`
 */

/** 약관 타입 (백엔드 TermsType enum과 동일) */
export type TermsType = "SELLER_TERMS_OF_SERVICE" | "SELLER_PRIVACY_POLICY";

export interface TermsDocumentResponseDto {
  id: string;
  type: TermsType;
  version: string;
  title: string;
  content: string;
  isActive: boolean;
  effectiveAt: string;
  createdAt: string;
  updatedAt: string;
}
