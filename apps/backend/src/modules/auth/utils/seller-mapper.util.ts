import { Seller } from "@apps/backend/infra/database/prisma/generated/client";
import { SellerMypageProfileResponseDto } from "@apps/backend/modules/auth/dto/mypage-profile.dto";

export class SellerMapperUtil {
  static mapToSellerInfo(seller: Seller, lastLoginAt?: Date): SellerMypageProfileResponseDto {
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
      agreedToTermsAt: seller.agreedToTermsAt ?? null,
      agreedToPrivacyAt: seller.agreedToPrivacyAt ?? null,
    };
  }
}
