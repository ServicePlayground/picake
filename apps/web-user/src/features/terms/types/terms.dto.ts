/**
 * 약관 API 타입 — 백엔드 `TermsDocumentResponseDto`와 정합
 * Base: `GET /v1/consumer/terms/:type`
 */

/** 약관 타입 (백엔드 TermsType enum과 동일) */
export type TermsType =
  | "CONSUMER_TERMS_OF_SERVICE"
  | "CONSUMER_PRIVACY_POLICY"
  | "CONSUMER_THIRD_PARTY_CONSENT"
  | "CONSUMER_LOCATION_TERMS";

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
