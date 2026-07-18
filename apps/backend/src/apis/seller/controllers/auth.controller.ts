import { Controller, Post, Body, Get, HttpCode, HttpStatus, Request } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { AuthService } from "@apps/backend/modules/auth/auth.service";
import { FindAccountRequestDto } from "@apps/backend/modules/auth/dto/auth-find-account.dto";
import {
  GoogleLoginRequestDto,
  GoogleRegisterRequestDto,
} from "@apps/backend/modules/auth/dto/auth-google-oauth.dto";
import {
  KakaoLoginRequestDto,
  KakaoRegisterRequestDto,
} from "@apps/backend/modules/auth/dto/auth-kakao-oauth.dto";
import {
  SendVerificationCodeRequestDto,
  VerifyPhoneCodeRequestDto,
} from "@apps/backend/modules/auth/dto/auth-phone-verification.dto";
import { Auth } from "@apps/backend/modules/auth/decorators/auth.decorator";
import { SwaggerResponse } from "@apps/backend/common/decorators/swagger-response.decorator";
import { SwaggerAuthResponses } from "@apps/backend/common/decorators/swagger-auth-responses.decorator";
import { JwtVerifiedPayload } from "@apps/backend/modules/auth/types/auth.types";
import {
  AUTH_ERROR_MESSAGES,
  AUTH_SUCCESS_MESSAGES,
  AUDIENCE,
  SWAGGER_EXAMPLES,
} from "@apps/backend/modules/auth/constants/auth.constants";
import { createMessageObject } from "@apps/backend/common/utils/message.util";

@ApiTags("[판매자] 인증")
@Controller(`${AUDIENCE.SELLER}/auth`)
@Auth({ isPublic: true })
export class SellerAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("google/login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "구글 로그인 (판매자)",
    description:
      "프론트엔드에서 받은 Authorization Code로 구글 로그인을 처리합니다. 응답에서 accessToken과 refreshToken을 반환합니다. 400 PHONE_VERIFICATION_REQUIRED 오류가 발생했을 때는 googleId와 googleEmail을 반환하며 휴대폰 인증 후 구글 회원가입 API로 해당 파라미터 값을 전달하여 회원가입을 처리해야 합니다.",
  })
  @SwaggerResponse(200, { dataExample: SWAGGER_EXAMPLES.TOKEN_RESPONSE })
  @SwaggerResponse(400, {
    dataExample: {
      message: AUTH_ERROR_MESSAGES.PHONE_VERIFICATION_REQUIRED,
      googleId: SWAGGER_EXAMPLES.CONSUMER_DATA.googleId,
      googleEmail: SWAGGER_EXAMPLES.CONSUMER_DATA.googleEmail,
    },
  })
  @SwaggerResponse(400, {
    dataExample: createMessageObject(AUTH_ERROR_MESSAGES.GOOGLE_OAUTH_TOKEN_EXCHANGE_FAILED),
  })
  @SwaggerResponse(403, {
    dataExample: createMessageObject(AUTH_ERROR_MESSAGES.ACCOUNT_INACTIVE),
  })
  async googleAuth(@Body() authDto: GoogleLoginRequestDto) {
    return await this.authService.sellerGoogleLoginWithCode(authDto);
  }

  @Post("google/register")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "구글 회원가입 (판매자, 휴대폰 인증 후)",
    description:
      "새로운 구글 사용자를 등록합니다. 응답에서 accessToken과 refreshToken을 반환합니다. 휴대폰 인증이 완료된 상태여야 합니다. 동일한 구글 ID와 휴대폰 번호가 존재할 경우 중복 에러가 발생합니다.",
  })
  @SwaggerResponse(201, { dataExample: SWAGGER_EXAMPLES.TOKEN_RESPONSE })
  @SwaggerResponse(409, {
    dataExample: {
      message: AUTH_ERROR_MESSAGES.PHONE_GOOGLE_ACCOUNT_EXISTS,
      name: "김*매",
      phone: "010-****-5432",
    },
  })
  @SwaggerResponse(409, {
    dataExample: {
      message: AUTH_ERROR_MESSAGES.PHONE_KAKAO_ACCOUNT_EXISTS,
      name: "김*매",
      phone: "010-****-5432",
    },
  })
  async googleRegisterWithPhone(@Body() registerDto: GoogleRegisterRequestDto) {
    return await this.authService.sellerGoogleRegisterWithPhone(registerDto);
  }

  @Post("kakao/login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "카카오 로그인 (판매자)",
    description:
      "프론트엔드에서 받은 Authorization Code로 카카오 로그인을 처리합니다. 응답에서 accessToken과 refreshToken을 반환합니다. 400 PHONE_VERIFICATION_REQUIRED 오류가 발생했을 때는 kakaoId와 kakaoEmail을 반환하며 휴대폰 인증 후 카카오 회원가입 API로 해당 파라미터 값을 전달하여 회원가입을 처리해야 합니다.",
  })
  @SwaggerResponse(200, { dataExample: SWAGGER_EXAMPLES.TOKEN_RESPONSE })
  @SwaggerResponse(400, {
    dataExample: {
      message: AUTH_ERROR_MESSAGES.PHONE_VERIFICATION_REQUIRED,
      kakaoId: SWAGGER_EXAMPLES.KAKAO_ID,
      kakaoEmail: SWAGGER_EXAMPLES.KAKAO_EMAIL,
    },
  })
  @SwaggerResponse(400, {
    dataExample: createMessageObject(AUTH_ERROR_MESSAGES.KAKAO_OAUTH_TOKEN_EXCHANGE_FAILED),
  })
  @SwaggerResponse(403, {
    dataExample: createMessageObject(AUTH_ERROR_MESSAGES.ACCOUNT_INACTIVE),
  })
  async kakaoAuth(@Body() authDto: KakaoLoginRequestDto) {
    return await this.authService.sellerKakaoLoginWithCode(authDto);
  }

  @Post("kakao/register")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "카카오 회원가입 (판매자, 휴대폰 인증 후)",
    description:
      "새로운 카카오 사용자를 등록합니다. 응답에서 accessToken과 refreshToken을 반환합니다. 휴대폰 인증이 완료된 상태여야 합니다. 동일한 카카오 ID와 휴대폰 번호가 존재할 경우 중복 에러가 발생합니다.",
  })
  @SwaggerResponse(201, { dataExample: SWAGGER_EXAMPLES.TOKEN_RESPONSE })
  @SwaggerResponse(409, {
    dataExample: {
      message: AUTH_ERROR_MESSAGES.PHONE_KAKAO_ACCOUNT_EXISTS,
      name: "김*매",
      phone: "010-****-5432",
    },
  })
  @SwaggerResponse(409, {
    dataExample: {
      message: AUTH_ERROR_MESSAGES.PHONE_GOOGLE_ACCOUNT_EXISTS,
      name: "김*매",
      phone: "010-****-5432",
    },
  })
  async kakaoRegisterWithPhone(@Body() registerDto: KakaoRegisterRequestDto) {
    return await this.authService.sellerKakaoRegisterWithPhone(registerDto);
  }

  @Post("find-account")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "계정 찾기 (판매자)",
    description:
      "휴대폰 인증을 `audience: seller`, `purpose: find_account`로 완료한 뒤 호출합니다.",
  })
  @SwaggerResponse(200, {
    dataExample: {
      loginType: "google",
      loginId: SWAGGER_EXAMPLES.SELLER_DATA.googleId,
      loginEmail: SWAGGER_EXAMPLES.SELLER_DATA.googleEmail,
    },
  })
  @SwaggerResponse(400, {
    dataExample: createMessageObject(AUTH_ERROR_MESSAGES.PHONE_VERIFICATION_REQUIRED),
  })
  @SwaggerResponse(400, {
    dataExample: createMessageObject(AUTH_ERROR_MESSAGES.ACCOUNT_NOT_FOUND_BY_PHONE),
  })
  async findAccount(@Body() dto: FindAccountRequestDto) {
    return await this.authService.findAccountSeller(dto);
  }

  @Post("send-verification-code")
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({
    summary: "휴대폰 인증번호 발송",
    description: "요청의 `audience`는 이 경로에서 `seller`로 고정됩니다.",
  })
  @SwaggerResponse(200, {
    dataExample: {
      message: AUTH_SUCCESS_MESSAGES.PHONE_VERIFICATION_SENT,
      expiresAt: "2026-04-19T12:05:00.000Z",
    },
  })
  @SwaggerResponse(400, {
    dataExample: createMessageObject(AUTH_ERROR_MESSAGES.PHONE_INVALID_FORMAT),
  })
  async sendVerificationCode(@Body() sendCodeDto: SendVerificationCodeRequestDto) {
    const { expiresAt } = await this.authService.sendVerificationCode({
      ...sendCodeDto,
      audience: AUDIENCE.SELLER,
    });
    return {
      message: AUTH_SUCCESS_MESSAGES.PHONE_VERIFICATION_SENT,
      expiresAt: expiresAt.toISOString(),
    };
  }

  @Post("verify-phone-code")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "휴대폰 인증번호 확인",
    description: "요청의 `audience`는 이 경로에서 `seller`로 고정됩니다.",
  })
  @SwaggerResponse(200, {
    dataExample: createMessageObject(AUTH_SUCCESS_MESSAGES.PHONE_VERIFICATION_CONFIRMED),
  })
  async verifyPhoneCode(@Body() verifyCodeDto: VerifyPhoneCodeRequestDto) {
    await this.authService.verifyPhoneCode({
      ...verifyCodeDto,
      audience: AUDIENCE.SELLER,
    });
    return createMessageObject(AUTH_SUCCESS_MESSAGES.PHONE_VERIFICATION_CONFIRMED);
  }

  @Get("me")
  @Auth({ isPublic: false, audiences: ["seller"] })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 액세스 토큰 유효 확인",
    description: "가드를 통과하면 `{ available: true }`만 반환합니다.",
  })
  @SwaggerResponse(200, { dataExample: { available: true } })
  @SwaggerAuthResponses()
  async getCurrentSeller(@Request() req: { user: JwtVerifiedPayload }) {
    return this.authService.getCurrentSeller(req.user);
  }
}
