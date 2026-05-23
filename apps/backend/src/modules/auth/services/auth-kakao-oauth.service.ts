import { Injectable, ConflictException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import { JwtUtil } from "@apps/backend/modules/auth/utils/jwt.util";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosInstance } from "axios";
import {
  AUTH_ERROR_MESSAGES,
  AUDIENCE,
  PhoneVerificationPurpose,
} from "@apps/backend/modules/auth/constants/auth.constants";
import { KakaoUserInfo } from "@apps/backend/modules/auth/types/auth.types";
import { AuthPhoneService } from "@apps/backend/modules/auth/services/auth-phone.service";
import { AuthWithdrawService } from "@apps/backend/modules/auth/services/auth-withdraw.service";
import { PhoneUtil } from "@apps/backend/modules/auth/utils/phone.util";
import { maskDisplayNameForPrivacy } from "@apps/backend/modules/auth/utils/display-name.util";
import {
  KakaoLoginRequestDto,
  KakaoRegisterRequestDto,
} from "@apps/backend/modules/auth/dto/auth-kakao-oauth.dto";
import { LoggerUtil } from "@apps/backend/common/utils/logger.util";
import { buildInitialNicknameFromName } from "@apps/backend/modules/auth/utils/google-register-nickname.util";
import { SentryUtil } from "@apps/backend/common/utils/sentry.util";

@Injectable()
export class AuthKakaoOauthService {
  private readonly kakaoClientId: string;
  private readonly kakaoClientSecret: string;
  private readonly kakaoClientIdSeller: string;
  private readonly kakaoClientSecretSeller: string;
  private readonly consumerBase: string;
  private readonly consumerPath: string;
  private readonly sellerBase: string;
  private readonly sellerPath: string;
  private readonly httpClient: AxiosInstance;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtUtil: JwtUtil,
    private readonly configService: ConfigService,
    private readonly authPhoneService: AuthPhoneService,
    private readonly withdrawService: AuthWithdrawService,
  ) {
    this.kakaoClientId = configService.get<string>("KAKAO_CLIENT_ID")!;
    this.kakaoClientSecret = configService.get<string>("KAKAO_CLIENT_SECRET") ?? "";
    this.kakaoClientIdSeller = configService.get<string>("KAKAO_CLIENT_ID_SELLER")!;
    this.kakaoClientSecretSeller = configService.get<string>("KAKAO_CLIENT_SECRET_SELLER") ?? "";
    this.consumerBase = this.configService.get<string>("PUBLIC_USER_DOMAIN")!;
    this.consumerPath = this.configService.get<string>("KAKAO_REDIRECT_URI")!;
    this.sellerBase = this.configService.get<string>("PUBLIC_SELLER_DOMAIN")!;
    this.sellerPath = this.configService.get<string>("KAKAO_REDIRECT_URI_SELLER")!;
    this.httpClient = axios.create({
      timeout: 30000,
      headers: {
        "User-Agent": "Picake-Backend/1.0",
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate, br",
      },
      maxRedirects: 5,
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
  }

  async consumerKakaoLoginWithCode(dto: KakaoLoginRequestDto) {
    const kakaoUserInfo = await this.exchangeCodeForToken(
      dto.code,
      `${this.consumerBase}${this.consumerPath.startsWith("/") ? this.consumerPath : `/${this.consumerPath}`}`,
      {
        clientId: this.kakaoClientId,
        clientSecret: this.kakaoClientSecret,
      },
    );
    return this.kakaoLogin(kakaoUserInfo);
  }

  async sellerKakaoLoginWithCode(dto: KakaoLoginRequestDto) {
    const kakaoUserInfo = await this.exchangeCodeForToken(
      dto.code,
      `${this.sellerBase}${this.sellerPath.startsWith("/") ? this.sellerPath : `/${this.sellerPath}`}`,
      {
        clientId: this.kakaoClientIdSeller,
        clientSecret: this.kakaoClientSecretSeller,
      },
    );
    return this.kakaoLoginSeller(kakaoUserInfo);
  }

  private async exchangeCodeForToken(
    code: string,
    redirectUri: string,
    credentials: { clientId: string; clientSecret: string },
  ): Promise<KakaoUserInfo> {
    try {
      const { clientId, clientSecret } = credentials;
      const params = new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        redirect_uri: redirectUri,
        code: decodeURIComponent(code),
      });
      if (clientSecret) {
        params.set("client_secret", clientSecret);
      }

      const tokenResponse = await this.httpClient.post(
        "https://kauth.kakao.com/oauth/token",
        params,
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        },
      );

      const accessToken = tokenResponse.data?.access_token;
      if (!accessToken) {
        throw new BadRequestException(AUTH_ERROR_MESSAGES.KAKAO_OAUTH_TOKEN_EXCHANGE_FAILED);
      }

      const userInfoResponse = await this.httpClient.get("https://kapi.kakao.com/v2/user/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const userInfo = userInfoResponse.data;
      const kakaoId = userInfo?.id?.toString();
      const kakaoEmail = userInfo?.kakao_account?.email;
      if (!kakaoId || !kakaoEmail) {
        throw new BadRequestException(AUTH_ERROR_MESSAGES.KAKAO_OAUTH_TOKEN_EXCHANGE_FAILED);
      }

      return {
        userInfo: {
          kakaoId,
          kakaoEmail,
        },
      };
    } catch (error: any) {
      const sanitizedError = {
        code: error.code,
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
      };
      LoggerUtil.log(`Kakao OAuth 에러 발생: ${JSON.stringify(sanitizedError, null, 2)}`);
      const status = error.response?.status;
      if (!status || status >= 500) {
        SentryUtil.captureException(error, "error", {
          module: "auth-kakao-oauth",
          operation: "exchange-code-for-token",
        });
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(AUTH_ERROR_MESSAGES.KAKAO_OAUTH_TOKEN_EXCHANGE_FAILED);
    }
  }

  private async kakaoLogin(kakaoUserInfo: KakaoUserInfo) {
    const {
      userInfo: { kakaoId, kakaoEmail },
    } = kakaoUserInfo;

    let consumer = await this.prisma.consumer.findUnique({
      where: { kakaoId },
    });

    if (consumer && !consumer.isActive) {
      await this.withdrawService.purgeIfInactiveConsumer(consumer);
      consumer = null;
    }

    if (!consumer) {
      throw new BadRequestException({
        message: AUTH_ERROR_MESSAGES.PHONE_VERIFICATION_REQUIRED,
        kakaoId,
        kakaoEmail,
      });
    }
    if (!consumer.phone || !consumer.isPhoneVerified) {
      throw new BadRequestException({
        message: AUTH_ERROR_MESSAGES.PHONE_VERIFICATION_REQUIRED,
        kakaoId,
        kakaoEmail,
      });
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

  private async kakaoLoginSeller(kakaoUserInfo: KakaoUserInfo) {
    const {
      userInfo: { kakaoId, kakaoEmail },
    } = kakaoUserInfo;

    if (!kakaoId) {
      throw new BadRequestException({
        message: AUTH_ERROR_MESSAGES.KAKAO_OAUTH_TOKEN_EXCHANGE_FAILED,
      });
    }

    let seller = await this.prisma.seller.findUnique({
      where: { kakaoId },
    });

    if (seller && !seller.isActive) {
      await this.withdrawService.purgeIfInactiveSeller(seller);
      seller = null;
    }

    if (!seller) {
      throw new BadRequestException({
        message: AUTH_ERROR_MESSAGES.PHONE_VERIFICATION_REQUIRED,
        kakaoId,
        kakaoEmail,
      });
    }
    if (!seller.phone || !seller.isPhoneVerified) {
      throw new BadRequestException({
        message: AUTH_ERROR_MESSAGES.PHONE_VERIFICATION_REQUIRED,
        kakaoId,
        kakaoEmail,
      });
    }
    return await this.prisma.$transaction(async (tx) => {
      const tokenPair = await this.jwtUtil.generateTokenPair({
        sub: seller.id,
        aud: AUDIENCE.SELLER,
      });
      await tx.seller.update({
        where: { id: seller.id },
        data: { lastLoginAt: new Date() },
      });
      return { accessToken: tokenPair.accessToken, refreshToken: tokenPair.refreshToken };
    });
  }

  async consumerKakaoRegisterWithPhone(kakaoRegisterDto: KakaoRegisterRequestDto) {
    const {
      kakaoId,
      kakaoEmail,
      phone,
      name,
      agreedToTerms,
      agreedToPrivacy,
      agreedToThirdParty,
      agreedToLocationTerms,
    } = kakaoRegisterDto;
    const trimmedName = name.trim();
    const normalizedPhone = PhoneUtil.normalizePhone(phone);

    // 1. 필수 약관 동의 여부 검증
    if (!agreedToTerms || !agreedToPrivacy || !agreedToThirdParty) {
      throw new BadRequestException(AUTH_ERROR_MESSAGES.REQUIRED_TERMS_NOT_AGREED);
    }

    const existing = await this.prisma.consumer.findUnique({ where: { kakaoId } });
    if (existing && !(await this.withdrawService.purgeIfInactiveConsumer(existing))) {
      throw new ConflictException(AUTH_ERROR_MESSAGES.KAKAO_ID_ALREADY_EXISTS);
    }

    const isPhoneVerified = await this.authPhoneService.checkPhoneVerificationStatus(
      normalizedPhone,
      AUDIENCE.CONSUMER,
      PhoneVerificationPurpose.KAKAO_REGISTRATION,
    );
    if (!isPhoneVerified) {
      throw new BadRequestException(AUTH_ERROR_MESSAGES.PHONE_VERIFICATION_REQUIRED);
    }

    let existingPhone = await this.prisma.consumer.findFirst({
      where: { phone: normalizedPhone },
    });
    if (existingPhone && !existingPhone.isActive) {
      await this.withdrawService.purgeIfInactiveConsumer(existingPhone);
      existingPhone = null;
    }

    if (existingPhone?.kakaoId) {
      throw new ConflictException({
        message: AUTH_ERROR_MESSAGES.PHONE_KAKAO_ACCOUNT_EXISTS,
        name: maskDisplayNameForPrivacy(existingPhone.name),
        phone: PhoneUtil.maskPhone(existingPhone.phone),
      });
    }
    if (existingPhone?.googleId) {
      throw new ConflictException({
        message: AUTH_ERROR_MESSAGES.PHONE_GOOGLE_ACCOUNT_EXISTS,
        name: maskDisplayNameForPrivacy(existingPhone.name),
        phone: PhoneUtil.maskPhone(existingPhone.phone),
      });
    }

    return await this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const row = await tx.consumer.create({
        data: {
          kakaoId,
          kakaoEmail,
          phone: normalizedPhone,
          name: trimmedName,
          nickname: buildInitialNicknameFromName(trimmedName),
          isPhoneVerified: true,
          lastLoginAt: now,
          agreedToTermsAt: agreedToTerms ? now : null,
          agreedToPrivacyAt: agreedToPrivacy ? now : null,
          agreedToThirdPartyAt: agreedToThirdParty ? now : null,
          agreedToLocationTermsAt: agreedToLocationTerms ? now : null,
        },
      });
      const tokenPair = await this.jwtUtil.generateTokenPair({
        sub: row.id,
        aud: AUDIENCE.CONSUMER,
      });
      return { accessToken: tokenPair.accessToken, refreshToken: tokenPair.refreshToken };
    });
  }

  async sellerKakaoRegisterWithPhone(kakaoRegisterDto: KakaoRegisterRequestDto) {
    const { kakaoId, kakaoEmail, phone, name, agreedToTerms, agreedToPrivacy } = kakaoRegisterDto;
    const trimmedName = name.trim();
    const normalizedPhone = PhoneUtil.normalizePhone(phone);

    // 1. 필수 약관 동의 여부 검증
    if (!agreedToTerms || !agreedToPrivacy) {
      throw new BadRequestException(AUTH_ERROR_MESSAGES.REQUIRED_TERMS_NOT_AGREED);
    }

    const existing = await this.prisma.seller.findUnique({ where: { kakaoId } });
    if (existing && !(await this.withdrawService.purgeIfInactiveSeller(existing))) {
      throw new ConflictException(AUTH_ERROR_MESSAGES.KAKAO_ID_ALREADY_EXISTS);
    }

    const isPhoneVerified = await this.authPhoneService.checkPhoneVerificationStatus(
      normalizedPhone,
      AUDIENCE.SELLER,
      PhoneVerificationPurpose.KAKAO_REGISTRATION,
    );
    if (!isPhoneVerified) {
      throw new BadRequestException(AUTH_ERROR_MESSAGES.PHONE_VERIFICATION_REQUIRED);
    }

    let existingPhone = await this.prisma.seller.findFirst({
      where: { phone: normalizedPhone },
    });
    if (existingPhone && !existingPhone.isActive) {
      await this.withdrawService.purgeIfInactiveSeller(existingPhone);
      existingPhone = null;
    }

    if (existingPhone?.kakaoId) {
      throw new ConflictException({
        message: AUTH_ERROR_MESSAGES.PHONE_KAKAO_ACCOUNT_EXISTS,
        name: maskDisplayNameForPrivacy(existingPhone.name),
        phone: PhoneUtil.maskPhone(existingPhone.phone),
      });
    }
    if (existingPhone?.googleId) {
      throw new ConflictException({
        message: AUTH_ERROR_MESSAGES.PHONE_GOOGLE_ACCOUNT_EXISTS,
        name: maskDisplayNameForPrivacy(existingPhone.name),
        phone: PhoneUtil.maskPhone(existingPhone.phone),
      });
    }

    return await this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const row = await tx.seller.create({
        data: {
          kakaoId,
          kakaoEmail,
          phone: normalizedPhone,
          name: trimmedName,
          nickname: buildInitialNicknameFromName(trimmedName),
          isPhoneVerified: true,
          lastLoginAt: now,
          sellerVerificationStatus: "REGISTERED",
          agreedToTermsAt: agreedToTerms ? now : null,
          agreedToPrivacyAt: agreedToPrivacy ? now : null,
        },
      });
      const tokenPair = await this.jwtUtil.generateTokenPair({
        sub: row.id,
        aud: AUDIENCE.SELLER,
      });
      return { accessToken: tokenPair.accessToken, refreshToken: tokenPair.refreshToken };
    });
  }
}
