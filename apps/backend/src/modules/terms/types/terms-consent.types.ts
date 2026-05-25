import { TermsType } from "@apps/backend/infra/database/prisma/generated/client";

export type TermsAgreementWithDocument = {
  termsDocument: { type: TermsType; version: string };
};

export type ConsumerTermsVersions = {
  agreedTermsVersion: string | null;
  agreedPrivacyVersion: string | null;
  agreedThirdPartyVersion: string | null;
  agreedLocationTermsVersion: string | null;
};

export type SellerTermsVersions = {
  agreedTermsVersion: string | null;
  agreedPrivacyVersion: string | null;
};
