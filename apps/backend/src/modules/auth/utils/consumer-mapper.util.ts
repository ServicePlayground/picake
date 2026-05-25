import { Consumer } from "@apps/backend/infra/database/prisma/generated/client";
import { ConsumerMypageProfileResponseDto } from "@apps/backend/modules/auth/dto/mypage-profile.dto";
import { TermsConsentMapperUtil } from "@apps/backend/modules/terms/utils/terms-consent-mapper.util";
import { TermsAgreementWithDocument } from "@apps/backend/modules/terms/types/terms-consent.types";

export class ConsumerMapperUtil {
  static mapConsumerToInfo(
    user: Consumer,
    lastLoginAt?: Date,
    pushNotificationsEnabled: boolean = true,
    termsAgreements: TermsAgreementWithDocument[] = [],
  ): ConsumerMypageProfileResponseDto {
    const termsVersions = TermsConsentMapperUtil.mapConsumerVersions(termsAgreements);

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
      ...termsVersions,
    };
  }
}
