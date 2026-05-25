import type { TermsType } from "@/apps/web-admin/features/terms/types/terms.dto";
import consumerLocationTerms from "@/apps/web-admin/features/terms/samples/consumer/location-terms-sample.html?raw";
import consumerPrivacyPolicy from "@/apps/web-admin/features/terms/samples/consumer/privacy-policy-sample.html?raw";
import consumerTermsOfService from "@/apps/web-admin/features/terms/samples/consumer/terms-of-service-sample.html?raw";
import consumerThirdPartyConsent from "@/apps/web-admin/features/terms/samples/consumer/third-party-consent-sample.html?raw";
import sellerPrivacyPolicy from "@/apps/web-admin/features/terms/samples/seller/privacy-policy-sample.html?raw";
import sellerTermsOfService from "@/apps/web-admin/features/terms/samples/seller/terms-of-service-sample.html?raw";

/** 약관 유형별 HTML 샘플 */
export const TERMS_CONTENT_SAMPLES: Partial<Record<TermsType, string>> = {
  CONSUMER_TERMS_OF_SERVICE: consumerTermsOfService.trim(),
  CONSUMER_PRIVACY_POLICY: consumerPrivacyPolicy.trim(),
  CONSUMER_THIRD_PARTY_CONSENT: consumerThirdPartyConsent.trim(),
  CONSUMER_LOCATION_TERMS: consumerLocationTerms.trim(),
  SELLER_TERMS_OF_SERVICE: sellerTermsOfService.trim(),
  SELLER_PRIVACY_POLICY: sellerPrivacyPolicy.trim(),
};

export function getTermsContentSample(type: TermsType): string | undefined {
  return TERMS_CONTENT_SAMPLES[type];
}

export function hasTermsContentSample(type: TermsType): boolean {
  return type in TERMS_CONTENT_SAMPLES;
}
