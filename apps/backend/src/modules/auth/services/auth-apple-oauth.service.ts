import {
  Injectable,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import { JwtUtil } from "@apps/backend/modules/auth/utils/jwt.util";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosInstance } from "axios";
import * as jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import {
  AUTH_ERROR_MESSAGES,
  AUDIENCE,
  OAUTH_REDIRECT_PATHS,
  APPLE_PRIMARY_APP_ID,
  APPLE_ISSUER,
  getAppleRedirectBaseUrl,
  PhoneVerificationPurpose,
} from "@apps/backend/modules/auth/constants/auth.constants";
import { AppleUserInfo, AppleIdTokenPayload } from "@apps/backend/modules/auth/types/auth.types";
import { AuthPhoneService } from "@apps/backend/modules/auth/services/auth-phone.service";
import { PhoneUtil } from "@apps/backend/modules/auth/utils/phone.util";
import { maskDisplayNameForPrivacy } from "@apps/backend/modules/auth/utils/display-name.util";
import {
  AppleLoginRequestDto,
  AppleRegisterRequestDto,
} from "@apps/backend/modules/auth/dto/auth-apple-oauth.dto";
import { buildInitialNickname } from "@apps/backend/modules/auth/utils/register-nickname.util";
import { ExternalApiErrorUtil } from "@apps/backend/common/utils/external-api-error.util";
import { TokenEncryptionUtil } from "@apps/backend/common/utils/token-encryption.util";
import { TermsService } from "@apps/backend/modules/terms/terms.service";

/**
 * 애플(Sign in with Apple) OAuth — 구매자(web-user)만 지원, 판매자는 대상 아님.
 *
 * 구글/카카오와 다른 점 (반드시 숙지):
 * - `client_secret`이 고정 문자열이 아니라 매 요청 직전 서버가 직접 서명하는 JWT(ES256).
 * - Google처럼 access_token으로 별도 userinfo를 조회하지 않고, 토큰 교환 응답에 함께 오는
 *   `id_token`(JWT)을 Apple JWKS로 검증해 `sub`/`email`을 바로 추출.
 * - `refresh_token`은 탈퇴 시 `/auth/revoke` 호출(Apple 가이드라인 5.1.1(v))에 필요해 암호화 후 저장.
 * - Return URL 도메인은 `PUBLIC_USER_DOMAIN`(dev=localhost)이 아니라 `getAppleRedirectBaseUrl`
 *   (dev도 staging 도메인 고정 — Apple Services ID는 HTTPS 도메인만 등록 가능).
 */
@Injectable()
export class AuthAppleOauthService {
  private readonly teamId: string;
  private readonly keyId: string;
  private readonly privateKey: string;
  private readonly clientId: string;
  private readonly redirectUri: string;
  private readonly httpClient: AxiosInstance;
  private readonly jwks: ReturnType<typeof jwksClient>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtUtil: JwtUtil,
    private readonly configService: ConfigService,
    private readonly authPhoneService: AuthPhoneService,
    private readonly termsService: TermsService,
    private readonly tokenEncryptionUtil: TokenEncryptionUtil,
  ) {
    this.teamId = configService.get<string>("APPLE_TEAM_ID")!;
    this.keyId = configService.get<string>("APPLE_KEY_ID")!;
    this.privateKey = configService.get<string>("APPLE_PRIVATE_KEY")!.replace(/\\n/g, "\n");
    this.clientId = configService.get<string>("APPLE_CLIENT_ID")!;
    this.redirectUri = `${getAppleRedirectBaseUrl(configService.get<string>("NODE_ENV"))}${OAUTH_REDIRECT_PATHS.APPLE}`;
    this.httpClient = axios.create({
      timeout: 30000,
      headers: {
        "User-Agent": "Picake-Backend/1.0",
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate, br",
      },
      maxRedirects: 5,
      /** 4xx도 throw 하지 않음 → 아래에서 status·본문 검증 필수 */
      validateStatus: (status) => status < 500,
      httpsAgent: new (require("https").Agent)({
        keepAlive: true,
        keepAliveMsecs: 30000,
        maxSockets: 50,
        maxFreeSockets: 10,
        timeout: 30000,
        freeSocketTimeout: 30000,
      }),
    });
    this.jwks = jwksClient({
      jwksUri: `${APPLE_ISSUER}/auth/keys`,
      cache: true,
      cacheMaxAge: 6 * 60 * 60 * 1000,
      rateLimit: true,
    });
  }

  async consumerAppleLoginWithCode(dto: AppleLoginRequestDto) {
    const appleUserInfo = await this.exchangeCodeForToken(dto.code);
    return this.appleLogin(appleUserInfo);
  }

  /**
   * 매 요청 직전 Team ID/Key ID/`.p8` private key로 서명하는 client_secret(ES256 JWT).
   * Apple 최대 만료 6개월까지 허용하지만 재사용할 이유가 없어 요청마다 새로 발급합니다(1시간).
   */
  private buildClientSecret(): string {
    const now = Math.floor(Date.now() / 1000);
    return jwt.sign(
      {
        iss: this.teamId,
        iat: now,
        exp: now + 3600,
        aud: APPLE_ISSUER,
        sub: this.clientId,
      },
      this.privateKey,
      { algorithm: "ES256", keyid: this.keyId },
    );
  }

  /**
   * Authorization Code로 토큰 교환 후 id_token 검증.
   * @throws BadRequestException `APPLE_OAUTH_TOKEN_EXCHANGE_FAILED` — 코드 만료·redirect_uri 불일치 등
   */
  private async exchangeCodeForToken(code: string): Promise<AppleUserInfo> {
    try {
      const tokenResponse = await this.httpClient.post(
        `${APPLE_ISSUER}/auth/token`,
        new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.buildClientSecret(),
          code: decodeURIComponent(code),
          grant_type: "authorization_code",
          redirect_uri: this.redirectUri,
        }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
      );

      const idToken = tokenResponse.data?.id_token;
      const refreshToken = tokenResponse.data?.refresh_token;
      if (!idToken || !refreshToken) {
        const failure = {
          provider: "apple",
          module: "auth-apple-oauth",
          operation: "token-exchange",
          ...ExternalApiErrorUtil.fromResponseBody(tokenResponse.data, tokenResponse.status),
          details: { redirectUri: this.redirectUri },
        };
        ExternalApiErrorUtil.reportFailure(
          failure,
          ExternalApiErrorUtil.createFailureError(failure, "no_id_token_or_refresh_token"),
        );
        throw new BadRequestException(AUTH_ERROR_MESSAGES.APPLE_OAUTH_TOKEN_EXCHANGE_FAILED);
      }

      const payload = await this.verifyIdToken(idToken);
      const appleId = payload.sub;
      const appleEmail = payload.email;
      if (!appleId || !appleEmail) {
        const failure = {
          provider: "apple",
          module: "auth-apple-oauth",
          operation: "id-token-verify",
          details: { hasAppleId: Boolean(appleId), hasAppleEmail: Boolean(appleEmail) },
        };
        ExternalApiErrorUtil.reportFailure(
          failure,
          ExternalApiErrorUtil.createFailureError(failure, "missing_sub_or_email"),
        );
        throw new BadRequestException(AUTH_ERROR_MESSAGES.APPLE_OAUTH_TOKEN_EXCHANGE_FAILED);
      }

      return {
        userInfo: { appleId, appleEmail },
        refreshToken,
      };
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      const failure = {
        provider: "apple",
        module: "auth-apple-oauth",
        operation: "exchange-code-for-token",
        ...ExternalApiErrorUtil.fromAxiosError(error),
        details: { redirectUri: this.redirectUri },
      };
      ExternalApiErrorUtil.reportFailure(failure, error);
      throw new BadRequestException(AUTH_ERROR_MESSAGES.APPLE_OAUTH_TOKEN_EXCHANGE_FAILED);
    }
  }

  /**
   * Apple JWKS(`https://appleid.apple.com/auth/keys`)로 id_token 서명 검증(RS256).
   * `aud`는 웹 리다이렉트(Services ID)·네이티브(Primary App ID) 값을 모두 허용합니다
   * (심사 통과를 위해 웹 방식을 우선 쓰되, 추후 네이티브 전환 시에도 코드 변경 없이 대응).
   */
  private verifyIdToken(idToken: string): Promise<AppleIdTokenPayload> {
    return new Promise((resolve, reject) => {
      jwt.verify(
        idToken,
        (header, callback) => {
          if (!header.kid) {
            callback(new Error("id_token header에 kid가 없습니다."));
            return;
          }
          this.jwks.getSigningKey(header.kid, (err, key) => {
            if (err || !key) {
              callback(err ?? new Error("Apple JWKS에서 signing key를 찾지 못했습니다."));
              return;
            }
            callback(null, key.getPublicKey());
          });
        },
        {
          algorithms: ["RS256"],
          audience: [this.clientId, APPLE_PRIMARY_APP_ID],
          issuer: APPLE_ISSUER,
        },
        (err, decoded) => {
          if (err || !decoded) {
            reject(err ?? new Error("id_token 검증에 실패했습니다."));
            return;
          }
          resolve(decoded as AppleIdTokenPayload);
        },
      );
    });
  }

  /**
   * 애플 로그인 처리 (구매자)
   */
  async appleLogin(appleUserInfo: AppleUserInfo) {
    const {
      userInfo: { appleId, appleEmail },
      refreshToken,
    } = appleUserInfo;

    const consumer = await this.prisma.consumer.findUnique({ where: { appleId } });

    if (!consumer) {
      throw new BadRequestException({
        message: AUTH_ERROR_MESSAGES.PHONE_VERIFICATION_REQUIRED,
        appleId,
        appleEmail,
      });
    }

    if (!consumer.isActive) {
      throw new ForbiddenException(AUTH_ERROR_MESSAGES.ACCOUNT_INACTIVE);
    }

    if (!consumer.phone || !consumer.isPhoneVerified) {
      throw new BadRequestException({
        message: AUTH_ERROR_MESSAGES.PHONE_VERIFICATION_REQUIRED,
        appleId,
        appleEmail,
      });
    }

    return await this.prisma.$transaction(async (tx) => {
      const tokenPair = await this.jwtUtil.generateTokenPair({
        sub: consumer.id,
        aud: AUDIENCE.CONSUMER,
      });
      await tx.consumer.update({
        where: { id: consumer.id },
        data: {
          lastLoginAt: new Date(),
          // 재로그인 때도 최신 refresh_token으로 갱신 — 탈퇴 시 revoke가 항상 유효한 토큰을 쓰도록
          appleRefreshToken: this.tokenEncryptionUtil.encrypt(refreshToken),
        },
      });
      return { accessToken: tokenPair.accessToken, refreshToken: tokenPair.refreshToken };
    });
  }

  /**
   * 애플 회원가입(구매자) — 휴대폰 `APPLE_REGISTRATION` 인증 완료 후에만 진행.
   * 로그인과 별개 호출이라 여기서도 code 교환을 다시 하지 않고, 프론트가 로그인 실패 응답으로 받은
   * `appleId`/`appleEmail`을 그대로 전달받습니다 — `refresh_token`은 가입 완료 후 최초 로그인 시 저장됩니다.
   * @throws ConflictException 이미 다른 애플과 연결된 번호 / 동일 번호 비애플 계정 / 이미 존재하는 appleId
   */
  async consumerAppleRegisterWithPhone(appleRegisterDto: AppleRegisterRequestDto) {
    const { appleId, appleEmail, phone, name, agreedToTerms, agreedToPrivacy, agreedToThirdParty } =
      appleRegisterDto;
    const trimmedName = name.trim();
    const normalizedPhone = PhoneUtil.normalizePhone(phone);

    if (!agreedToTerms || !agreedToPrivacy || !agreedToThirdParty) {
      throw new BadRequestException(AUTH_ERROR_MESSAGES.REQUIRED_TERMS_NOT_AGREED);
    }

    const existing = await this.prisma.consumer.findUnique({ where: { appleId } });
    if (existing) {
      if (!existing.isActive) {
        throw new ForbiddenException(AUTH_ERROR_MESSAGES.ACCOUNT_INACTIVE);
      }
      throw new ConflictException(AUTH_ERROR_MESSAGES.APPLE_ID_ALREADY_EXISTS);
    }

    const isPhoneVerified = await this.authPhoneService.checkPhoneVerificationStatus(
      normalizedPhone,
      AUDIENCE.CONSUMER,
      PhoneVerificationPurpose.APPLE_REGISTRATION,
    );
    if (!isPhoneVerified) {
      throw new BadRequestException(AUTH_ERROR_MESSAGES.PHONE_VERIFICATION_REQUIRED);
    }

    const existingPhone = await this.prisma.consumer.findFirst({
      where: { phone: normalizedPhone },
    });
    if (existingPhone && !existingPhone.isActive) {
      throw new ForbiddenException(AUTH_ERROR_MESSAGES.ACCOUNT_INACTIVE);
    }

    if (existingPhone?.googleId) {
      throw new ConflictException({
        message: AUTH_ERROR_MESSAGES.PHONE_GOOGLE_ACCOUNT_EXISTS,
        name: maskDisplayNameForPrivacy(existingPhone.name),
        phone: PhoneUtil.maskPhone(existingPhone.phone),
      });
    }

    if (existingPhone?.kakaoId) {
      throw new ConflictException({
        message: AUTH_ERROR_MESSAGES.PHONE_KAKAO_ACCOUNT_EXISTS,
        name: maskDisplayNameForPrivacy(existingPhone.name),
        phone: PhoneUtil.maskPhone(existingPhone.phone),
      });
    }

    if (existingPhone?.appleId) {
      throw new ConflictException({
        message: AUTH_ERROR_MESSAGES.PHONE_APPLE_ACCOUNT_EXISTS,
        name: maskDisplayNameForPrivacy(existingPhone.name),
        phone: PhoneUtil.maskPhone(existingPhone.phone),
      });
    }

    return await this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const row = await tx.consumer.create({
        data: {
          appleId,
          appleEmail,
          phone: normalizedPhone,
          name: trimmedName,
          nickname: buildInitialNickname(),
          isPhoneVerified: true,
          lastLoginAt: now,
        },
      });

      await this.termsService.recordConsumerAgreementsInTransaction(
        tx,
        row.id,
        appleRegisterDto.termsDocumentIds ?? [],
      );

      const tokenPair = await this.jwtUtil.generateTokenPair({
        sub: row.id,
        aud: AUDIENCE.CONSUMER,
      });
      return { accessToken: tokenPair.accessToken, refreshToken: tokenPair.refreshToken };
    });
  }

  /**
   * 탈퇴 시 Apple 가이드라인 5.1.1(v) 대응 — 저장해둔 `refresh_token`으로 `/auth/revoke` 호출.
   * 이미 revoke됐거나 애초에 저장된 토큰이 없어도(과거 데이터) 탈퇴 자체를 막지 않습니다 — 로그만 남깁니다.
   */
  async revokeToken(encryptedRefreshToken: string): Promise<void> {
    try {
      const refreshToken = this.tokenEncryptionUtil.decrypt(encryptedRefreshToken);
      await this.httpClient.post(
        `${APPLE_ISSUER}/auth/revoke`,
        new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.buildClientSecret(),
          token: refreshToken,
          token_type_hint: "refresh_token",
        }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
      );
    } catch (error: any) {
      const failure = {
        provider: "apple",
        module: "auth-apple-oauth",
        operation: "revoke",
        ...ExternalApiErrorUtil.fromAxiosError(error ?? {}),
      };
      ExternalApiErrorUtil.reportFailure(failure, error);
    }
  }
}
