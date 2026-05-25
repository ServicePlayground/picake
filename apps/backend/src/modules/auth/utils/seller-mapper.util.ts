import { Seller } from "@apps/backend/infra/database/prisma/generated/client";
import { SellerMypageProfileResponseDto } from "@apps/backend/modules/auth/dto/mypage-profile.dto";
import { TermsConsentMapperUtil } from "@apps/backend/modules/terms/utils/terms-consent-mapper.util";
import { TermsAgreementWithDocument } from "@apps/backend/modules/terms/types/terms-consent.types";

export class SellerMapperUtil {
  static mapToSellerInfo(
    seller: Seller,
    lastLoginAt?: Date,
    termsAgreements: TermsAgreementWithDocument[] = [],
  ): SellerMypageProfileResponseDto {
    const termsVersions = TermsConsentMapperUtil.mapSellerVersions(termsAgreements);

    return {
      id: seller.id,
      phone: seller.phone,
      name: seller.name ?? "",
      nickname: seller.nickname ?? "",
      profileImageUrl: seller.profileImageUrl ?? "",
      isPhoneVerified: seller.isPhoneVerified,
      isActive: seller.isActive,
      googleId: seller.googleId ?? "",
      googleEmail: seller.googleEmail ?? "",
      kakaoId: seller.kakaoId ?? "",
      kakaoEmail: seller.kakaoEmail ?? "",
      sellerVerificationStatus: seller.sellerVerificationStatus,
      createdAt: seller.createdAt,
      lastLoginAt: lastLoginAt ?? seller.lastLoginAt ?? new Date(),
      ...termsVersions,
    };
  }
}
