/**
 * 약관 API 타입 (백엔드 terms DTO와 정합)
 */

export type TermsType =
  | "CONSUMER_TERMS_OF_SERVICE"
  | "CONSUMER_PRIVACY_POLICY"
  | "CONSUMER_THIRD_PARTY_CONSENT"
  | "CONSUMER_LOCATION_TERMS"
  | "SELLER_TERMS_OF_SERVICE"
  | "SELLER_PRIVACY_POLICY";

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

export interface TermsDocumentSummaryResponseDto {
  id: string;
  type: TermsType;
  version: string;
  title: string;
  isActive: boolean;
  effectiveAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface TermsActiveMapResponseDto {
  data: TermsDocumentSummaryResponseDto[];
}

export interface TermsVersionListResponseDto {
  data: TermsDocumentSummaryResponseDto[];
}

export interface CreateTermsDocumentRequestDto {
  type: TermsType;
  version: string;
  title: string;
  content: string;
  effectiveAt: string;
  activateNow?: boolean;
}
