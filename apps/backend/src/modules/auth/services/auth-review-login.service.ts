import { timingSafeEqual } from "crypto";
import { ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import { JwtUtil } from "@apps/backend/modules/auth/utils/jwt.util";
import {
  AUDIENCE,
  AUTH_ERROR_MESSAGES,
  REVIEW_LOGIN_ACCOUNT_PHONE_MARKER,
  REVIEW_LOGIN_CODE,
} from "@apps/backend/modules/auth/constants/auth.constants";
import { ReviewLoginRequestDto } from "@apps/backend/modules/auth/dto/auth-review-login.dto";

/**
 * 앱스토어/플레이스토어 심사(리뷰) 대응 전용 로그인.
 *
 * 코드는 env가 아니라 `REVIEW_LOGIN_CODE` 상수로 소스에 하드코딩되어 있어 별도 설정 없이 바로 동작합니다.
 * 심사용 계정도 미리 시드해 둘 필요 없이, 최초 호출 시 `REVIEW_LOGIN_ACCOUNT_PHONE_MARKER`로 자동 upsert됩니다
 * (실제 휴대폰 번호 형식이 아니라서 실사용자 계정과 겹치지 않음).
 */
@Injectable()
export class AuthReviewLoginService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtUtil: JwtUtil,
  ) {}

  async consumerReviewLogin(dto: ReviewLoginRequestDto) {
    if (!this.isCodeMatch(dto.code, REVIEW_LOGIN_CODE)) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.REVIEW_LOGIN_INVALID_CODE);
    }

    const consumer = await this.prisma.consumer.upsert({
      where: { phone: REVIEW_LOGIN_ACCOUNT_PHONE_MARKER },
      update: {},
      create: {
        phone: REVIEW_LOGIN_ACCOUNT_PHONE_MARKER,
        nickname: "심사용 계정",
        isPhoneVerified: true,
        isActive: true,
      },
    });

    if (!consumer.isActive) {
      throw new ForbiddenException(AUTH_ERROR_MESSAGES.ACCOUNT_INACTIVE);
    }

    return await this.prisma.$transaction(async (tx) => {
      const tokenPair = await this.jwtUtil.generateTokenPair({
        sub: consumer.id,
        aud: AUDIENCE.CONSUMER,
      });
      await tx.consumer.update({
        where: { id: consumer.id },
        data: { lastLoginAt: new Date() },
      });
      return { accessToken: tokenPair.accessToken, refreshToken: tokenPair.refreshToken };
    });
  }

  /** 길이가 다르면 즉시 false, 같을 때만 timingSafeEqual로 비교 (타이밍 공격 방지) */
  private isCodeMatch(input: string, expected: string): boolean {
    const inputBuf = Buffer.from(input);
    const expectedBuf = Buffer.from(expected);
    if (inputBuf.length !== expectedBuf.length) return false;
    return timingSafeEqual(inputBuf, expectedBuf);
  }
}
