import { Controller, Post, Get, Body, HttpCode, HttpStatus, Request } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { AuthService } from "@apps/backend/modules/auth/auth.service";
import { Auth } from "@apps/backend/modules/auth/decorators/auth.decorator";
import { SwaggerResponse } from "@apps/backend/common/decorators/swagger-response.decorator";
import { SwaggerAuthResponses } from "@apps/backend/common/decorators/swagger-auth-responses.decorator";
import { JwtVerifiedPayload } from "@apps/backend/modules/auth/types/auth.types";
import {
  AUDIENCE,
  AUTH_ERROR_MESSAGES,
  AUTH_SUCCESS_MESSAGES,
  SWAGGER_EXAMPLES,
  TOKEN_TYPES,
} from "@apps/backend/modules/auth/constants/auth.constants";
import {
  AdminLoginRequestDto,
  AdminRegisterRequestDto,
  AdminTotpEnableRequestDto,
  AdminTotpVerifyLoginRequestDto,
} from "@apps/backend/modules/auth/dto/auth-admin.dto";

@ApiTags("[관리자] 인증")
@Controller(`${AUDIENCE.ADMIN}/auth`)
@Auth({ isPublic: true })
export class AdminAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "관리자 회원가입 (ID/비밀번호)" })
  @SwaggerResponse(201, {
    dataExample: {
      id: SWAGGER_EXAMPLES.ADMIN_DATA.id,
      username: SWAGGER_EXAMPLES.ADMIN_DATA.username,
      createdAt: SWAGGER_EXAMPLES.ADMIN_DATA.createdAt,
    },
  })
  @SwaggerResponse(409, {
    dataExample: { message: AUTH_ERROR_MESSAGES.USERNAME_ALREADY_EXISTS },
  })
  async register(@Body() dto: AdminRegisterRequestDto) {
    return await this.authService.adminRegister(dto);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "관리자 로그인",
    description:
      "Google OTP 미등록: `requireTotpSetup`·`totpSetupPendingToken` 만 반환 → Bearer로 `POST .../totp/setup`·`totp/enable` 후 다시 로그인. " +
      "OTP 등록 완료 계정: `requireTotp`·`totpPendingToken` → `POST .../login/totp-verify` 후 액세스·리프레시 토큰.",
  })
  @SwaggerResponse(200, {
    dataExample: SWAGGER_EXAMPLES.ADMIN_LOGIN_TOTP_SETUP_REQUIRED,
  })
  @SwaggerResponse(
    200,
    { dataExample: SWAGGER_EXAMPLES.ADMIN_LOGIN_TOTP_PENDING },
    "이미 Google OTP를 켠 계정(비밀번호 검증 후 2단계 대기)",
  )
  async login(@Body() dto: AdminLoginRequestDto) {
    return await this.authService.adminLogin(dto);
  }

  @Post("login/totp-verify")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "로그인 2단계: TOTP 코드 검증 후 최종 토큰 발급" })
  @SwaggerResponse(200, { dataExample: SWAGGER_EXAMPLES.TOKEN_RESPONSE })
  async verifyTotpLogin(@Body() dto: AdminTotpVerifyLoginRequestDto) {
    return await this.authService.adminVerifyTotpLogin(dto);
  }

  @Post("totp/setup")
  @HttpCode(HttpStatus.OK)
  @Auth({
    isPublic: false,
    audiences: [AUDIENCE.ADMIN],
    jwtTypes: [TOKEN_TYPES.ACCESS, TOKEN_TYPES.TOTP_SETUP_PENDING],
  })
  @ApiOperation({
    summary: "Google OTP 설정 시작",
    description:
      "액세스 토큰(이미 로그인됨) 또는 `totp_setup_pending` 임시 토큰(최초 OTP 등록 중)으로 호출 가능.",
  })
  @SwaggerResponse(200, {
    dataExample: { secret: "JBSWY3DPEHPK3PXP", otpauthUrl: "otpauth://totp/..." },
  })
  @SwaggerAuthResponses()
  async setupTotp(@Request() req: { user: JwtVerifiedPayload }) {
    return await this.authService.adminSetupTotp(req.user.sub);
  }

  @Post("totp/enable")
  @HttpCode(HttpStatus.OK)
  @Auth({
    isPublic: false,
    audiences: [AUDIENCE.ADMIN],
    jwtTypes: [TOKEN_TYPES.ACCESS, TOKEN_TYPES.TOTP_SETUP_PENDING],
  })
  @ApiOperation({
    summary: "Google OTP 활성화",
    description:
      "액세스 토큰 또는 `totp_setup_pending` 임시 토큰으로 호출. 앱에서 받은 6자리 코드로 검증 후 `isTotpEnabled` 가 true 가 됨.",
  })
  @SwaggerResponse(200, {
    dataExample: { message: AUTH_SUCCESS_MESSAGES.ADMIN_TOTP_ENABLED },
  })
  @SwaggerAuthResponses()
  async enableTotp(
    @Request() req: { user: JwtVerifiedPayload },
    @Body() dto: AdminTotpEnableRequestDto,
  ) {
    return await this.authService.adminEnableTotp(req.user.sub, dto);
  }

  @Get("me")
  @HttpCode(HttpStatus.OK)
  @Auth({ isPublic: false, audiences: [AUDIENCE.ADMIN] })
  @ApiOperation({ summary: "(로그인 필요) 액세스 토큰 유효 확인" })
  @SwaggerResponse(200, { dataExample: { available: true } })
  @SwaggerAuthResponses()
  async getMe(@Request() req: { user: JwtVerifiedPayload }) {
    return this.authService.getCurrentAdmin(req.user);
  }
}
