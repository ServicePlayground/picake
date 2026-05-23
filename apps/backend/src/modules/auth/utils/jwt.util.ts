import { JwtService } from "@nestjs/jwt";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TOKEN_TYPES, JWT_EXPIRATION } from "@apps/backend/modules/auth/constants/auth.constants";
import { AuthTokenPairResponseDto } from "@apps/backend/modules/auth/dto/auth-token.dto";
import { JwtPayload, JwtVerifiedPayload } from "@apps/backend/modules/auth/types/auth.types";
@Injectable()
export class JwtUtil {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 액세스 토큰과 리프레시 토큰을 생성합니다.
   * @param payload JWT 페이로드
   * @returns 토큰 쌍
   */
  async generateTokenPair(payload: JwtPayload): Promise<AuthTokenPairResponseDto> {
    const accessTokenPayload = {
      ...payload,
      type: TOKEN_TYPES.ACCESS,
    };

    const refreshTokenPayload = {
      ...payload,
      type: TOKEN_TYPES.REFRESH,
    };

    // 액세스 토큰과 리프레시 토큰 생성
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessTokenPayload, {
        expiresIn: JWT_EXPIRATION.ACCESS_TOKEN,
      }),
      this.jwtService.signAsync(refreshTokenPayload, {
        expiresIn: JWT_EXPIRATION.REFRESH_TOKEN,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * 액세스 토큰을 생성합니다.
   * @param payload JWT 페이로드
   * @returns 액세스 토큰
   */
  async generateAccessToken(payload: JwtPayload): Promise<string> {
    const accessTokenPayload = {
      ...payload,
      type: TOKEN_TYPES.ACCESS,
    };

    return await this.jwtService.signAsync(accessTokenPayload, {
      expiresIn: JWT_EXPIRATION.ACCESS_TOKEN,
    });
  }

  /**
   * TOTP 2단계 인증 대기 임시 토큰 (5분 유효)
   */
  async generateTotpPendingToken(payload: JwtPayload): Promise<string> {
    return await this.jwtService.signAsync(
      { ...payload, type: TOKEN_TYPES.TOTP_PENDING },
      { expiresIn: "5m" },
    );
  }

  /** 관리자 최초 Google OTP 등록용 임시 토큰(액세스·리프레시 없음) */
  async generateTotpSetupPendingToken(payload: JwtPayload): Promise<string> {
    return await this.jwtService.signAsync(
      { ...payload, type: TOKEN_TYPES.TOTP_SETUP_PENDING },
      { expiresIn: "30m" },
    );
  }

  /**
   * 토큰을 검증하고 페이로드를 반환합니다.
   * @param token JWT 토큰
   * @returns 검증된 페이로드
   */
  async verifyToken(token: string): Promise<JwtVerifiedPayload> {
    return await this.jwtService.verifyAsync(token);
  }
}
