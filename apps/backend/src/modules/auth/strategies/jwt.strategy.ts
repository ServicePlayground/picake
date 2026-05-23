import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import { AuthenticatedUser, JwtVerifiedPayload } from "@apps/backend/modules/auth/types/auth.types";
import {
  AUTH_ERROR_MESSAGES,
  TOKEN_TYPES,
  AUDIENCE,
} from "@apps/backend/modules/auth/constants/auth.constants";
import { LoggerUtil } from "@apps/backend/common/utils/logger.util";

/**
 * JWT 전략 (passport-jwt)
 *
 * 흐름: 요청 → Controller → `@Auth` → `AuthGuard("jwt")` → Passport → 본 전략 → `validate` 반환값이 `req.user`.
 *
 * 수행하는 일:
 * 1. `Authorization: Bearer <token>` 에서 액세스 토큰 문자열 추출 (`jwtFromRequest`)
 * 2. `JWT_SECRET` 으로 서명 검증·만료 검사 (passport-jwt, `validate` 호출 전에 처리)
 * 3. `validate` 에서 `type === access`, `sub`·`aud` 존재 여부 확인
 * 4. `aud` 가 consumer/seller/admin 인 경우 DB에서 해당 계정을 조회해 비활성 여부·`phone`·(seller면) 사업자 검증 상태 등 최신 값을 붙여 반환
 *
 * 발급 페이로드는 {@link JwtUtil} 기준 `sub`, `aud`, `type`(access|refresh|totp_pending|totp_setup_pending) 및 `iat`/`exp` 이다.
 * 역할·권한을 JWT에 넣지 않고, 필요한 필드는 매 요청 DB 조회로 맞춘다.
 *
 * 실패 시 `UnauthorizedException`(메시지는 `AUTH_ERROR_MESSAGES` 참고).
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const jwtSecret = configService.get<string>("JWT_SECRET");
    if (!jwtSecret) {
      LoggerUtil.log("JWT_SECRET environment variable is required");
      throw new Error("JWT_SECRET environment variable is required");
    }

    super({
      /** Bearer 가 없거나 비어 있으면 `null` → `AuthGuard` 쪽에서 optional/public 과 조합해 처리 */
      jwtFromRequest: (req: Request) => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return null;
        }

        const accessToken = authHeader.substring(7);

        if (!accessToken) {
          return null;
        }
        return accessToken;
      },
      secretOrKey: jwtSecret,
      /** `false`: 만료 토큰은 전략 단계에서 거부 (검증 오류는 주로 `AuthGuard.handleRequest`에서 메시지 매핑) */
      ignoreExpiration: false,
    });
  }

  /**
   * 서명·만료를 통과한 디코드 페이로드에 대해 타입·필수 필드·대상(`aud`)별 DB 일치 여부를 검사한다.
   *
   * @param payload — 최소 `sub`, `aud`, `type`(access), 표준 클레임 `iat`/`exp` 포함
   * @returns `AuthenticatedUser` (`req.user`)
   */
  async validate(payload: JwtVerifiedPayload): Promise<AuthenticatedUser> {
    try {
      if (!payload.sub || !payload.aud) {
        LoggerUtil.log(`JWT 검증 실패: 필수 필드 없음 - payload: ${JSON.stringify(payload)}`);
        throw new UnauthorizedException(AUTH_ERROR_MESSAGES.ACCESS_TOKEN_MISSING_REQUIRED_INFO);
      }

      if (payload.type === TOKEN_TYPES.TOTP_SETUP_PENDING) {
        if (payload.aud !== AUDIENCE.ADMIN) {
          LoggerUtil.log(`JWT 검증 실패: totp_setup_pending 은 admin 전용 - aud: ${payload.aud}`);
          throw new UnauthorizedException(AUTH_ERROR_MESSAGES.ACCESS_TOKEN_WRONG_TYPE);
        }
        return await this.validateAdminTotpSetupPending(payload);
      }

      if (payload.type !== TOKEN_TYPES.ACCESS) {
        LoggerUtil.log(`JWT 검증 실패: 잘못된 토큰 타입 - type: ${payload.type}`);
        throw new UnauthorizedException(AUTH_ERROR_MESSAGES.ACCESS_TOKEN_WRONG_TYPE);
      }

      if (payload.aud === AUDIENCE.CONSUMER) {
        return await this.validateConsumer(payload);
      }
      if (payload.aud === AUDIENCE.SELLER) {
        return await this.validateSeller(payload);
      }
      if (payload.aud === AUDIENCE.ADMIN) {
        return await this.validateAdmin(payload);
      }

      LoggerUtil.log(`JWT 검증 실패: 알 수 없는 aud - aud: ${payload.aud}`);
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.ACCESS_TOKEN_INVALID);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      // JWT 만료/형식 오류는 보통 validate 호출 전에 발생하나, 방어적으로 동일 메시지로 매핑
      if (error instanceof TokenExpiredError) {
        LoggerUtil.log(`JWT 검증 실패: 토큰 만료`);
        throw new UnauthorizedException(AUTH_ERROR_MESSAGES.ACCESS_TOKEN_EXPIRED);
      }
      if (error instanceof JsonWebTokenError) {
        LoggerUtil.log(`JWT 검증 실패: 토큰 형식 오류 - error: ${error.message}`);
        throw new UnauthorizedException(AUTH_ERROR_MESSAGES.ACCESS_TOKEN_INVALID);
      }
      LoggerUtil.log(
        `JWT 검증 실패: 알 수 없는 에러 - error: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.ACCESS_TOKEN_INVALID);
    }
  }

  /** `aud === consumer`: 계정 존재·활성 여부 확인 후 표시용 `loginId`(googleId) 등을 채운다. */
  private async validateConsumer(payload: JwtVerifiedPayload): Promise<AuthenticatedUser> {
    const c = await this.prisma.consumer.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        phone: true,
        googleId: true,
        kakaoId: true,
        isActive: true,
      },
    });

    if (!c) {
      LoggerUtil.log(`JWT 검증 실패: consumer 없음 - id: ${payload.sub}`);
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.ACCESS_TOKEN_ACCOUNT_NOT_FOUND);
    }
    if (!c.isActive) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.ACCESS_TOKEN_ACCOUNT_INACTIVE);
    }

    const loginType = c.kakaoId ? ("kakao" as const) : ("google" as const);
    const loginId = c.kakaoId ?? c.googleId ?? "";

    return {
      ...payload,
      aud: AUDIENCE.CONSUMER,
      id: c.id,
      phone: c.phone,
      loginType,
      loginId,
    };
  }

  /** `aud === admin`: Admin 계정 존재·활성 여부 확인 */
  private async validateAdmin(payload: JwtVerifiedPayload): Promise<AuthenticatedUser> {
    const admin = await this.prisma.admin.findUnique({
      where: { id: payload.sub },
      select: { id: true, username: true, isActive: true },
    });

    if (!admin) {
      LoggerUtil.log(`JWT 검증 실패: admin 없음 - id: ${payload.sub}`);
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.ACCESS_TOKEN_ACCOUNT_NOT_FOUND);
    }
    if (!admin.isActive) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.ACCESS_TOKEN_ACCOUNT_INACTIVE);
    }

    return {
      ...payload,
      aud: AUDIENCE.ADMIN,
      id: admin.id,
      username: admin.username,
    };
  }

  /**
   * 관리자 Google OTP **미등록** 상태에서만 유효 — 등록 완료 후에는 일반 로그인 필요
   */
  private async validateAdminTotpSetupPending(
    payload: JwtVerifiedPayload,
  ): Promise<AuthenticatedUser> {
    const admin = await this.prisma.admin.findUnique({
      where: { id: payload.sub },
      select: { id: true, username: true, isActive: true, isTotpEnabled: true },
    });

    if (!admin) {
      LoggerUtil.log(`JWT 검증 실패: admin 없음 - id: ${payload.sub}`);
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.ACCESS_TOKEN_ACCOUNT_NOT_FOUND);
    }
    if (!admin.isActive) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.ACCESS_TOKEN_ACCOUNT_INACTIVE);
    }
    if (admin.isTotpEnabled) {
      LoggerUtil.log(
        `JWT 검증 실패: totp_setup_pending 이지만 이미 OTP 활성화됨 - id: ${payload.sub}`,
      );
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.ACCESS_TOKEN_INVALID);
    }

    return {
      ...payload,
      type: TOKEN_TYPES.TOTP_SETUP_PENDING,
      aud: AUDIENCE.ADMIN,
      id: admin.id,
      username: admin.username,
    };
  }

  /** `aud === seller`: consumer와 동일하며 `sellerVerificationStatus` 를 추가로 실어 간다. */
  private async validateSeller(payload: JwtVerifiedPayload): Promise<AuthenticatedUser> {
    const s = await this.prisma.seller.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        phone: true,
        googleId: true,
        kakaoId: true,
        isActive: true,
        sellerVerificationStatus: true,
      },
    });

    if (!s) {
      LoggerUtil.log(`JWT 검증 실패: seller 없음 - id: ${payload.sub}`);
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.ACCESS_TOKEN_ACCOUNT_NOT_FOUND);
    }
    if (!s.isActive) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.ACCESS_TOKEN_ACCOUNT_INACTIVE);
    }

    const loginType = s.kakaoId ? ("kakao" as const) : ("google" as const);
    const loginId = s.kakaoId ?? s.googleId ?? "";

    return {
      ...payload,
      aud: AUDIENCE.SELLER,
      id: s.id,
      phone: s.phone,
      loginType,
      loginId,
      sellerVerificationStatus: s.sellerVerificationStatus,
    };
  }
}
