import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import { PhoneUtil } from "@apps/backend/modules/auth/utils/phone.util";
import { FindAccountRequestDto } from "@apps/backend/modules/auth/dto/auth-find-account.dto";
import { AuthPhoneService } from "@apps/backend/modules/auth/services/auth-phone.service";
import {
  AUTH_ERROR_MESSAGES,
  AUDIENCE,
  PhoneVerificationPurpose,
  type AudienceConst,
} from "@apps/backend/modules/auth/constants/auth.constants";

/**
 * 계정 찾기 — 구매자·판매자 공통
 * 휴대폰 인증(`FIND_ACCOUNT`) 완료 후 호출
 */
@Injectable()
export class AuthAccountFindService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authPhoneService: AuthPhoneService,
  ) {}

  async findAccount(
    dto: FindAccountRequestDto,
    audience: typeof AUDIENCE.CONSUMER | typeof AUDIENCE.SELLER,
  ): Promise<{
    loginType: "google" | "kakao";
    loginId: string;
    loginEmail: string | null;
  }> {
    const normalizedPhone = PhoneUtil.normalizePhone(dto.phone);
    const verified = await this.authPhoneService.checkPhoneVerificationStatus(
      normalizedPhone,
      audience as AudienceConst,
      PhoneVerificationPurpose.FIND_ACCOUNT,
    );
    if (!verified) {
      throw new BadRequestException(AUTH_ERROR_MESSAGES.PHONE_VERIFICATION_REQUIRED);
    }

    if (audience === AUDIENCE.CONSUMER) {
      const row = await this.prisma.consumer.findUnique({
        where: { phone: normalizedPhone },
        select: {
          isActive: true,
          googleId: true,
          googleEmail: true,
          kakaoId: true,
          kakaoEmail: true,
        },
      });
      if (!row) {
        throw new NotFoundException(AUTH_ERROR_MESSAGES.ACCOUNT_NOT_FOUND_BY_PHONE);
      }
      if (!row.isActive) {
        throw new ForbiddenException(AUTH_ERROR_MESSAGES.ACCOUNT_INACTIVE);
      }
      if (row.kakaoId) {
        return {
          loginType: "kakao",
          loginId: row.kakaoId,
          loginEmail: row.kakaoEmail ?? null,
        };
      }
      if (row.googleId) {
        return {
          loginType: "google",
          loginId: row.googleId,
          loginEmail: row.googleEmail ?? null,
        };
      }
      throw new NotFoundException(AUTH_ERROR_MESSAGES.ACCOUNT_NOT_FOUND_BY_PHONE);
    }

    const row = await this.prisma.seller.findUnique({
      where: { phone: normalizedPhone },
      select: {
        isActive: true,
        googleId: true,
        googleEmail: true,
        kakaoId: true,
        kakaoEmail: true,
      },
    });
    if (!row) {
      throw new NotFoundException(AUTH_ERROR_MESSAGES.ACCOUNT_NOT_FOUND_BY_PHONE);
    }
    if (!row.isActive) {
      throw new ForbiddenException(AUTH_ERROR_MESSAGES.ACCOUNT_INACTIVE);
    }
    if (row.kakaoId) {
      return {
        loginType: "kakao",
        loginId: row.kakaoId,
        loginEmail: row.kakaoEmail ?? null,
      };
    }
    if (row.googleId) {
      return {
        loginType: "google",
        loginId: row.googleId,
        loginEmail: row.googleEmail ?? null,
      };
    }
    throw new NotFoundException(AUTH_ERROR_MESSAGES.ACCOUNT_NOT_FOUND_BY_PHONE);
  }
}
