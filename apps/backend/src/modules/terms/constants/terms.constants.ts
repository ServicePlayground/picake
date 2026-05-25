import { TermsType } from "@apps/backend/infra/database/prisma/generated/client";

export const TERMS_SELECT = {
  id: true,
  type: true,
  version: true,
  title: true,
  content: true,
  isActive: true,
  effectiveAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const TERMS_SUMMARY_SELECT = {
  id: true,
  type: true,
  version: true,
  title: true,
  isActive: true,
  effectiveAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

/** 마이페이지 프로필 조회 시 약관 동의 버전 include */
export const CONSUMER_TERMS_AGREEMENT_INCLUDE = {
  termsAgreements: {
    include: {
      termsDocument: { select: { type: true, version: true } },
    },
  },
} as const;

export const SELLER_TERMS_AGREEMENT_INCLUDE = {
  termsAgreements: {
    include: {
      termsDocument: { select: { type: true, version: true } },
    },
  },
} as const;

/** 구매자 공개 API에서 허용하는 약관 유형 */
export const CONSUMER_TERMS_TYPES = [
  TermsType.CONSUMER_TERMS_OF_SERVICE,
  TermsType.CONSUMER_PRIVACY_POLICY,
  TermsType.CONSUMER_THIRD_PARTY_CONSENT,
  TermsType.CONSUMER_LOCATION_TERMS,
] as const;

/** 판매자 공개 API에서 허용하는 약관 유형 */
export const SELLER_TERMS_TYPES = [
  TermsType.SELLER_TERMS_OF_SERVICE,
  TermsType.SELLER_PRIVACY_POLICY,
] as const;

export const TERMS_ERROR_MESSAGES = {
  NOT_FOUND: "약관을 찾을 수 없습니다.",
  VERSION_DUPLICATE: "이미 존재하는 버전입니다.",
  ACTIVE_NOT_FOUND: "현재 활성화된 약관이 없습니다.",
} as const;

/** 약관 타입별 한국어 표시명 */
export const TERMS_TYPE_LABEL: Record<TermsType, string> = {
  CONSUMER_TERMS_OF_SERVICE: "구매자 서비스 이용약관",
  CONSUMER_PRIVACY_POLICY: "구매자 개인정보 처리방침",
  CONSUMER_THIRD_PARTY_CONSENT: "구매자 개인정보 제3자 제공 동의",
  CONSUMER_LOCATION_TERMS: "구매자 위치기반서비스 이용약관",
  SELLER_TERMS_OF_SERVICE: "판매자 서비스 이용약관",
  SELLER_PRIVACY_POLICY: "판매자 개인정보 처리방침",
};
