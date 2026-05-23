import { Consumer } from "@apps/backend/infra/database/prisma/generated/client";
import { ConsumerMypageProfileResponseDto } from "@apps/backend/modules/auth/dto/mypage-profile.dto";

export class ConsumerMapperUtil {
  static mapConsumerToInfo(
    user: Consumer,
    lastLoginAt?: Date,
    pushNotificationsEnabled: boolean = true,
  ): ConsumerMypageProfileResponseDto {
    return {
      id: user.id,
      phone: user.phone,
      name: user.name ?? "",
      nickname: user.nickname ?? "",
      profileImageUrl: user.profileImageUrl ?? "",
      isPhoneVerified: user.isPhoneVerified,
      isActive: user.isActive,
      googleId: user.googleId ?? "",
      googleEmail: user.googleEmail ?? "",
      kakaoId: user.kakaoId ?? "",
      kakaoEmail: user.kakaoEmail ?? "",
      createdAt: user.createdAt,
      lastLoginAt: lastLoginAt ?? user.lastLoginAt ?? new Date(),
      pushNotificationsEnabled,
      agreedToTermsAt: user.agreedToTermsAt ?? null,
      agreedToPrivacyAt: user.agreedToPrivacyAt ?? null,
      agreedToThirdPartyAt: user.agreedToThirdPartyAt ?? null,
      agreedToLocationTermsAt: user.agreedToLocationTermsAt ?? null,
    };
  }
}
