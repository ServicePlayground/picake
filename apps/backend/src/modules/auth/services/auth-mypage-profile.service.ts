import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import {
  NotificationAppSurface,
  Prisma,
} from "@apps/backend/infra/database/prisma/generated/client";
import {
  ConsumerMypageProfileResponseDto,
  SellerMypageProfileResponseDto,
  UpdateMypageProfileRequestDto,
} from "@apps/backend/modules/auth/dto/mypage-profile.dto";
import type { JwtVerifiedPayload } from "@apps/backend/modules/auth/types/auth.types";
import { AUTH_ERROR_MESSAGES, AUDIENCE } from "@apps/backend/modules/auth/constants/auth.constants";
import { ConsumerMapperUtil } from "@apps/backend/modules/auth/utils/consumer-mapper.util";
import { SellerMapperUtil } from "@apps/backend/modules/auth/utils/seller-mapper.util";
import { LoggerUtil } from "@apps/backend/common/utils/logger.util";
import {
  CONSUMER_TERMS_AGREEMENT_INCLUDE,
  SELLER_TERMS_AGREEMENT_INCLUDE,
} from "@apps/backend/modules/terms/constants/terms.constants";

/**
 * 마이페이지 — 프로필 조회·수정 (구매자·판매자)
 */
@Injectable()
export class AuthMypageProfileService {
  constructor(private readonly prisma: PrismaService) {}

  private assertMypagePatchHasSomeField(dto: UpdateMypageProfileRequestDto): void {
    if (dto.name === undefined && dto.nickname === undefined && dto.profileImageUrl === undefined) {
      throw new BadRequestException(AUTH_ERROR_MESSAGES.PROFILE_UPDATE_NO_FIELDS);
    }
  }

  async getConsumerProfile(user: JwtVerifiedPayload): Promise<ConsumerMypageProfileResponseDto> {
    if (user.aud !== AUDIENCE.CONSUMER) {
      throw new ForbiddenException(AUTH_ERROR_MESSAGES.AUDIENCE_NOT_AUTHORIZED);
    }

    const [row, preference] = await Promise.all([
      this.prisma.consumer.findUnique({
        where: { id: user.sub },
        include: CONSUMER_TERMS_AGREEMENT_INCLUDE,
      }),
      this.prisma.consumerNotificationPreference.findUnique({
        where: {
          consumerId_appSurface: {
            consumerId: user.sub,
            appSurface: NotificationAppSurface.USER_WEB,
          },
        },
        select: { orderPushEnabled: true },
      }),
    ]);

    if (!row) {
      LoggerUtil.log(`구매자 프로필 조회 실패: consumer 없음 - id: ${user.sub}`);
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.ACCESS_TOKEN_ACCOUNT_NOT_FOUND);
    }

    return ConsumerMapperUtil.mapConsumerToInfo(
      row,
      undefined,
      preference?.orderPushEnabled ?? true,
      row.termsAgreements,
    );
  }

  async getSellerProfile(user: JwtVerifiedPayload): Promise<SellerMypageProfileResponseDto> {
    if (user.aud !== AUDIENCE.SELLER) {
      throw new ForbiddenException(AUTH_ERROR_MESSAGES.AUDIENCE_NOT_AUTHORIZED);
    }

    const row = await this.prisma.seller.findUnique({
      where: { id: user.sub },
      include: SELLER_TERMS_AGREEMENT_INCLUDE,
    });

    if (!row) {
      LoggerUtil.log(`판매자 프로필 조회 실패: seller 없음 - id: ${user.sub}`);
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.ACCESS_TOKEN_ACCOUNT_NOT_FOUND);
    }

    return SellerMapperUtil.mapToSellerInfo(row, undefined, row.termsAgreements);
  }

  async updateConsumerMypageProfile(
    dto: UpdateMypageProfileRequestDto,
    user: JwtVerifiedPayload,
  ): Promise<ConsumerMypageProfileResponseDto> {
    if (user.aud !== AUDIENCE.CONSUMER) {
      throw new ForbiddenException(AUTH_ERROR_MESSAGES.AUDIENCE_NOT_AUTHORIZED);
    }

    this.assertMypagePatchHasSomeField(dto);

    const existing = await this.prisma.consumer.findUnique({
      where: { id: user.sub },
    });

    if (!existing) {
      LoggerUtil.log(`구매자 프로필 수정 실패: consumer 없음 - id: ${user.sub}`);
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.ACCESS_TOKEN_ACCOUNT_NOT_FOUND);
    }

    const data: Prisma.ConsumerUpdateInput = {};
    if (dto.name !== undefined) {
      data.name = dto.name;
    }
    if (dto.nickname !== undefined) {
      data.nickname = dto.nickname;
    }
    if (dto.profileImageUrl !== undefined) {
      data.profileImageUrl = dto.profileImageUrl;
    }

    const updated = await this.prisma.consumer.update({
      where: { id: user.sub },
      data,
      include: CONSUMER_TERMS_AGREEMENT_INCLUDE,
    });

    return ConsumerMapperUtil.mapConsumerToInfo(updated, undefined, true, updated.termsAgreements);
  }

  async updateSellerMypageProfile(
    dto: UpdateMypageProfileRequestDto,
    user: JwtVerifiedPayload,
  ): Promise<SellerMypageProfileResponseDto> {
    if (user.aud !== AUDIENCE.SELLER) {
      throw new ForbiddenException(AUTH_ERROR_MESSAGES.AUDIENCE_NOT_AUTHORIZED);
    }

    this.assertMypagePatchHasSomeField(dto);

    const existing = await this.prisma.seller.findUnique({
      where: { id: user.sub },
    });

    if (!existing) {
      LoggerUtil.log(`판매자 프로필 수정 실패: seller 없음 - id: ${user.sub}`);
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.ACCESS_TOKEN_ACCOUNT_NOT_FOUND);
    }

    const data: Prisma.SellerUpdateInput = {};
    if (dto.name !== undefined) {
      data.name = dto.name;
    }
    if (dto.nickname !== undefined) {
      data.nickname = dto.nickname;
    }
    if (dto.profileImageUrl !== undefined) {
      data.profileImageUrl = dto.profileImageUrl;
    }

    const updated = await this.prisma.seller.update({
      where: { id: user.sub },
      data,
      include: SELLER_TERMS_AGREEMENT_INCLUDE,
    });

    return SellerMapperUtil.mapToSellerInfo(updated, undefined, updated.termsAgreements);
  }
}
