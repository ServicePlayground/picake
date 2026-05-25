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
import { GoogleUserInfo } from "@apps/backend/modules/auth/types/auth.types";
import { AuthPhoneService } from "@apps/backend/modules/auth/services/auth-phone.service";
import { AuthWithdrawService } from "@apps/backend/modules/auth/services/auth-withdraw.service";
import { PhoneUtil } from "@apps/backend/modules/auth/utils/phone.util";
import { maskDisplayNameForPrivacy } from "@apps/backend/modules/auth/utils/display-name.util";
import {
  GoogleLoginRequestDto,
  GoogleRegisterRequestDto,
} from "@apps/backend/modules/auth/dto/auth-google-oauth.dto";
import { LoggerUtil } from "@apps/backend/common/utils/logger.util";
import { buildInitialNicknameFromName } from "@apps/backend/modules/auth/utils/google-register-nickname.util";
import { SentryUtil } from "@apps/backend/common/utils/sentry.util";
import { TermsService } from "@apps/backend/modules/terms/terms.service";

/**
 * 구글 OAuth — Consumer / Seller 테이블·JWT aud 분리
 *
 * - 로그인: Authorization Code → 토큰 교환 → userinfo → DB 조회 후 JWT 발급
 * - 미가입·휴대폰 미인증: 프론트가 동일 메시지(`PHONE_VERIFICATION_REQUIRED`)로 회원가입(휴대폰 인증) 플로우로 분기
 */
@Injectable()
export class AuthGoogleOauthService {
  private readonly consumerGoogleClientId: string;
  private readonly consumerGoogleClientSecret: string;
  private readonly sellerGoogleClientId: string;
  private readonly sellerGoogleClientSecret: string;
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
    private readonly termsService: TermsService,
  ) {
    this.consumerGoogleClientId = configService.get<string>("GOOGLE_CLIENT_ID")!;
    this.consumerGoogleClientSecret = configService.get<string>("GOOGLE_CLIENT_SECRET")!;
    this.sellerGoogleClientId = configService.get<string>("GOOGLE_CLIENT_ID_SELLER")!;
    this.sellerGoogleClientSecret = configService.get<string>("GOOGLE_CLIENT_SECRET_SELLER")!;
    this.consumerBase = this.configService.get<string>("PUBLIC_USER_DOMAIN")!;
    this.consumerPath = this.configService.get<string>("GOOGLE_REDIRECT_URI")!;
    this.sellerBase = this.configService.get<string>("PUBLIC_SELLER_DOMAIN")!;
    this.sellerPath = this.configService.get<string>("GOOGLE_REDIRECT_URI_SELLER")!;
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
  }

  async consumerGoogleLoginWithCode(dto: GoogleLoginRequestDto) {
    const googleUserInfo = await this.exchangeCodeForToken(
      dto.code,
      `${this.consumerBase}${this.consumerPath.startsWith("/") ? this.consumerPath : `/${this.consumerPath}`}`,
      {
        clientId: this.consumerGoogleClientId,
        clientSecret: this.consumerGoogleClientSecret,
      },
    );
    return this.googleLogin(googleUserInfo);
  }

  async sellerGoogleLoginWithCode(dto: GoogleLoginRequestDto) {
    const googleUserInfo = await this.exchangeCodeForToken(
      dto.code,
      `${this.sellerBase}${this.sellerPath.startsWith("/") ? this.sellerPath : `/${this.sellerPath}`}`,
      {
        clientId: this.sellerGoogleClientId,
        clientSecret: this.sellerGoogleClientSecret,
      },
    );
    return this.googleLoginSeller(googleUserInfo);
  }

  /**
   * Authorization Code로 액세스 토큰 교환 후 Google userinfo 조회.
   * @throws BadRequestException `GOOGLE_OAUTH_TOKEN_EXCHANGE_FAILED` — 코드 만료·redirect_uri 불일치·클라이언트 불일치 등
   */
  private async exchangeCodeForToken(
    code: string,
    redirectUri: string,
    credentials: { clientId: string; clientSecret: string },
  ): Promise<GoogleUserInfo> {
    const { clientId, clientSecret } = credentials;
    try {
      const tokenResponse = await this.httpClient.post(
        "https://oauth2.googleapis.com/token",
        new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code: decodeURIComponent(code),
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );

      const { access_token, token_type } = tokenResponse.data;

      // Access Token으로 사용자 정보 요청
      LoggerUtil.log("사용자 정보 요청 시작");
      const userInfoResponse = await this.httpClient.get(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: {
            Authorization: `${token_type} ${access_token}`,
          },
        },
      );

      const userInfo = userInfoResponse.data;

      return {
        userInfo: {
          googleId: userInfo.id,
          googleEmail: userInfo.email,
        },
      };
    } catch (error: any) {
      // 민감 정보를 제거한 에러 로깅
      const sanitizedError = {
        code: error.code,
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
      };

      LoggerUtil.log(`Google OAuth 에러 발생: ${JSON.stringify(sanitizedError, null, 2)}`);
      const status = error.response?.status;
      if (!status || status >= 500) {
        SentryUtil.captureException(error, "error", {
          module: "auth-google-oauth",
          operation: "exchange-code-for-token",
        });
      }

      throw error;
    }
  }

  /**
   * 구글 로그인 처리 (사용자용)
   * @param googleUserInfo - 구글 사용자 정보
   * @returns 액세스 토큰 및 리프레시 토큰
   */
  async googleLogin(googleUserInfo: GoogleUserInfo) {
    const {
      userInfo: { googleId, googleEmail },
    } = googleUserInfo;

    let consumer = await this.prisma.consumer.findUnique({
      where: { googleId },
    });

    // 1. gooleId로 기존 사용자 조회
    if (consumer && !consumer.isActive) {
      await this.withdrawService.purgeIfInactiveConsumer(consumer);
      consumer = null;
    }

    if (!consumer) {
      // 새 사용자인 경우 -> 휴대폰 인증 필요
      throw new BadRequestException({
        message: AUTH_ERROR_MESSAGES.PHONE_VERIFICATION_REQUIRED,
        googleId,
        googleEmail,
      });
    }

    // 2. 휴대폰 인증 상태 확인
    if (!consumer.phone || !consumer.isPhoneVerified) {
      throw new BadRequestException({
        message: AUTH_ERROR_MESSAGES.PHONE_VERIFICATION_REQUIRED,
        googleId,
        googleEmail,
      });
    }

    // JWT 발급 및 마지막 로그인 시간 업데이트
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

  /**
   * 구글 로그인 처리 (판매자용)
   * @param googleUserInfo - 구글 사용자 정보
   * @returns 액세스 토큰 및 리프레시 토큰
   */
  private async googleLoginSeller(googleUserInfo: GoogleUserInfo) {
    const {
      userInfo: { googleId, googleEmail },
    } = googleUserInfo;

    if (!googleId) {
      throw new BadRequestException({
        message: AUTH_ERROR_MESSAGES.GOOGLE_OAUTH_TOKEN_EXCHANGE_FAILED,
      });
    }

    let seller = await this.prisma.seller.findUnique({
      where: { googleId },
    });

    // 1. gooleId로 기존 사용자 조회
    if (seller && !seller.isActive) {
      await this.withdrawService.purgeIfInactiveSeller(seller);
      seller = null;
    }

    if (!seller) {
      // 새 사용자인 경우 -> 휴대폰 인증 필요
      throw new BadRequestException({
        message: AUTH_ERROR_MESSAGES.PHONE_VERIFICATION_REQUIRED,
        googleId,
        googleEmail,
      });
    }

    // 2. 휴대폰 인증 상태 확인
    if (!seller.phone || !seller.isPhoneVerified) {
      throw new BadRequestException({
        message: AUTH_ERROR_MESSAGES.PHONE_VERIFICATION_REQUIRED,
        googleId,
        googleEmail,
      });
    }
    // JWT 발급 및 마지막 로그인 시간 업데이트
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

  /**
   * 구글 회원가입(구매자) — 휴대폰 `GOOGLE_REGISTRATION` 인증 완료 후에만 진행
   * @throws ConflictException 이미 다른 구글과 연결된 번호 / 동일 번호 비구글 계정 / 이미 존재하는 googleId
   */
  async consumerGoogleRegisterWithPhone(googleRegisterDto: GoogleRegisterRequestDto) {
    const {
      googleId,
      googleEmail,
      phone,
      name,
      agreedToTerms,
      agreedToPrivacy,
      agreedToThirdParty,
    } = googleRegisterDto;
    const trimmedName = name.trim();
    const normalizedPhone = PhoneUtil.normalizePhone(phone);

    // 1. 필수 약관 동의 여부 검증
    if (!agreedToTerms || !agreedToPrivacy || !agreedToThirdParty) {
      throw new BadRequestException(AUTH_ERROR_MESSAGES.REQUIRED_TERMS_NOT_AGREED);
    }

    // 3. 구글 ID 중복 검증 (필수)
    const existing = await this.prisma.consumer.findUnique({ where: { googleId } });
    if (existing && !(await this.withdrawService.purgeIfInactiveConsumer(existing))) {
      throw new ConflictException(AUTH_ERROR_MESSAGES.GOOGLE_ID_ALREADY_EXISTS);
    }

    // 4. 휴대폰 인증 상태 확인
    const isPhoneVerified = await this.authPhoneService.checkPhoneVerificationStatus(
      normalizedPhone,
      AUDIENCE.CONSUMER,
      PhoneVerificationPurpose.GOOGLE_REGISTRATION,
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

    // 5. 동일 번호 구글 계정 중복 검증
    if (existingPhone?.googleId) {
      throw new ConflictException({
        message: AUTH_ERROR_MESSAGES.PHONE_GOOGLE_ACCOUNT_EXISTS,
        name: maskDisplayNameForPrivacy(existingPhone.name),
        phone: PhoneUtil.maskPhone(existingPhone.phone),
      });
    }

    // 6. 동일 번호 카카오 계정 중복 검증
    if (existingPhone?.kakaoId) {
      throw new ConflictException({
        message: AUTH_ERROR_MESSAGES.PHONE_KAKAO_ACCOUNT_EXISTS,
        name: maskDisplayNameForPrivacy(existingPhone.name),
        phone: PhoneUtil.maskPhone(existingPhone.phone),
      });
    }

    return await this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const row = await tx.consumer.create({
        data: {
          googleId,
          googleEmail,
          phone: normalizedPhone,
          name: trimmedName,
          nickname: buildInitialNicknameFromName(trimmedName),
          isPhoneVerified: true,
          lastLoginAt: now,
        },
      });

      // 약관 버전 동의 이력 기록
      await this.termsService.recordConsumerAgreementsInTransaction(
        tx,
        row.id,
        googleRegisterDto.termsDocumentIds ?? [],
      );

      const tokenPair = await this.jwtUtil.generateTokenPair({
        sub: row.id,
        aud: AUDIENCE.CONSUMER,
      });
      return { accessToken: tokenPair.accessToken, refreshToken: tokenPair.refreshToken };
    });
  }

  /**
   * 구글 회원가입(판매자) — 휴대폰 `GOOGLE_REGISTRATION` 인증 완료 후에만 진행
   * @throws ConflictException 이미 다른 구글과 연결된 번호 / 동일 번호 비구글 계정 / 이미 존재하는 googleId
   */
  async sellerGoogleRegisterWithPhone(googleRegisterDto: GoogleRegisterRequestDto) {
    const { googleId, googleEmail, phone, name, agreedToTerms, agreedToPrivacy } =
      googleRegisterDto;
    const trimmedName = name.trim();
    const normalizedPhone = PhoneUtil.normalizePhone(phone);

    // 1. 필수 약관 동의 여부 검증
    if (!agreedToTerms || !agreedToPrivacy) {
      throw new BadRequestException(AUTH_ERROR_MESSAGES.REQUIRED_TERMS_NOT_AGREED);
    }

    // 2. 구글 ID 중복 검증 (필수)
    const existing = await this.prisma.seller.findUnique({ where: { googleId } });
    if (existing && !(await this.withdrawService.purgeIfInactiveSeller(existing))) {
      throw new ConflictException(AUTH_ERROR_MESSAGES.GOOGLE_ID_ALREADY_EXISTS);
    }

    // 2. 휴대폰 인증 상태 확인
    const isPhoneVerified = await this.authPhoneService.checkPhoneVerificationStatus(
      normalizedPhone,
      AUDIENCE.SELLER,
      PhoneVerificationPurpose.GOOGLE_REGISTRATION,
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

    // 3. 동일 번호 구글 계정 중복 검증
    if (existingPhone?.googleId) {
      throw new ConflictException({
        message: AUTH_ERROR_MESSAGES.PHONE_GOOGLE_ACCOUNT_EXISTS,
        name: maskDisplayNameForPrivacy(existingPhone.name),
        phone: PhoneUtil.maskPhone(existingPhone.phone),
      });
    }

    // 4. 동일 번호 카카오 계정 중복 검증
    if (existingPhone?.kakaoId) {
      throw new ConflictException({
        message: AUTH_ERROR_MESSAGES.PHONE_KAKAO_ACCOUNT_EXISTS,
        name: maskDisplayNameForPrivacy(existingPhone.name),
        phone: PhoneUtil.maskPhone(existingPhone.phone),
      });
    }

    return await this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const row = await tx.seller.create({
        data: {
          googleId,
          googleEmail,
          phone: normalizedPhone,
          name: trimmedName,
          nickname: buildInitialNicknameFromName(trimmedName),
          isPhoneVerified: true,
          lastLoginAt: now,
          sellerVerificationStatus: "REGISTERED",
        },
      });

      // 약관 버전 동의 이력 기록
      await this.termsService.recordSellerAgreementsInTransaction(
        tx,
        row.id,
        googleRegisterDto.termsDocumentIds ?? [],
      );

      const tokenPair = await this.jwtUtil.generateTokenPair({
        sub: row.id,
        aud: AUDIENCE.SELLER,
      });
      return { accessToken: tokenPair.accessToken, refreshToken: tokenPair.refreshToken };
    });
  }
}
