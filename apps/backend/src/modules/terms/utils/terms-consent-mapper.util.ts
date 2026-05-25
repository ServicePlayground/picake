import { TermsType } from "@apps/backend/infra/database/prisma/generated/client";
import {
  ConsumerTermsVersions,
  SellerTermsVersions,
  TermsAgreementWithDocument,
} from "@apps/backend/modules/terms/types/terms-consent.types";

/**
 * 약관 동의 이력 → 마이페이지 응답 버전 필드 매핑
 */
export class TermsConsentMapperUtil {
  static mapConsumerVersions(agreements: TermsAgreementWithDocument[]): ConsumerTermsVersions {
    const byType = new Map(agreements.map((a) => [a.termsDocument.type, a.termsDocument.version]));
    return {
      agreedTermsVersion: byType.get(TermsType.CONSUMER_TERMS_OF_SERVICE) ?? null,
      agreedPrivacyVersion: byType.get(TermsType.CONSUMER_PRIVACY_POLICY) ?? null,
      agreedThirdPartyVersion: byType.get(TermsType.CONSUMER_THIRD_PARTY_CONSENT) ?? null,
      agreedLocationTermsVersion: byType.get(TermsType.CONSUMER_LOCATION_TERMS) ?? null,
    };
  }

  static mapSellerVersions(agreements: TermsAgreementWithDocument[]): SellerTermsVersions {
    const byType = new Map(agreements.map((a) => [a.termsDocument.type, a.termsDocument.version]));
    return {
      agreedTermsVersion: byType.get(TermsType.SELLER_TERMS_OF_SERVICE) ?? null,
      agreedPrivacyVersion: byType.get(TermsType.SELLER_PRIVACY_POLICY) ?? null,
    };
  }
}
