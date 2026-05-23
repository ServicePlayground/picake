import { Injectable } from "@nestjs/common";
import { AuthPhoneService } from "@apps/backend/modules/auth/services/auth-phone.service";
import { AuthGoogleOauthService } from "@apps/backend/modules/auth/services/auth-google-oauth.service";
import { AuthKakaoOauthService } from "@apps/backend/modules/auth/services/auth-kakao-oauth.service";
import { AuthAdminService } from "@apps/backend/modules/auth/services/auth-admin.service";
import { AuthAccountFindService } from "@apps/backend/modules/auth/services/auth-account-find.service";
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
import {
  AdminLoginRequestDto,
  AdminRegisterRequestDto,
  AdminTotpEnableRequestDto,
  AdminTotpVerifyLoginRequestDto,
} from "@apps/backend/modules/auth/dto/auth-admin.dto";
import { JwtVerifiedPayload } from "@apps/backend/modules/auth/types/auth.types";
import { AUDIENCE } from "@apps/backend/modules/auth/constants/auth.constants";

/** 세션(액세스 토큰) 유효 확인 API 공통 응답 — DB 조회 없음 */
type SessionAvailabilityResponse = { available: true };

@Injectable()
export class AuthService {
  constructor(
    private readonly authAccountFindService: AuthAccountFindService,
    private readonly authPhoneService: AuthPhoneService,
    private readonly authGoogleOauthService: AuthGoogleOauthService,
    private readonly authKakaoOauthService: AuthKakaoOauthService,
    private readonly authAdminService: AuthAdminService,
  ) {}

  private getSessionAvailabilityResponse(): SessionAvailabilityResponse {
    return { available: true as const };
  }

  /**
   * 구글 — Authorization Code 로그인 (구매자). 리다이렉트 URI는 구매자 앱 기준.
   */
  async consumerGoogleLoginWithCode(dto: GoogleLoginRequestDto) {
    return this.authGoogleOauthService.consumerGoogleLoginWithCode(dto);
  }

  /**
   * 구글 — Authorization Code 로그인 (판매자). 리다이렉트 URI는 판매자 앱 기준.
   */
  async sellerGoogleLoginWithCode(dto: GoogleLoginRequestDto) {
    return this.authGoogleOauthService.sellerGoogleLoginWithCode(dto);
  }

  /**
   * 구글 — 회원가입·최초 연동 (휴대폰 인증 완료 후, 구매자)
   */
  async consumerGoogleRegisterWithPhone(dto: GoogleRegisterRequestDto) {
    return this.authGoogleOauthService.consumerGoogleRegisterWithPhone(dto);
  }

  /**
   * 구글 — 회원가입·최초 연동 (휴대폰 인증 완료 후, 판매자)
   */
  async sellerGoogleRegisterWithPhone(dto: GoogleRegisterRequestDto) {
    return this.authGoogleOauthService.sellerGoogleRegisterWithPhone(dto);
  }

  /**
   * 카카오 — Authorization Code 로그인 (구매자)
   */
  async consumerKakaoLoginWithCode(dto: KakaoLoginRequestDto) {
    return this.authKakaoOauthService.consumerKakaoLoginWithCode(dto);
  }

  /**
   * 카카오 — 회원가입·최초 연동 (휴대폰 인증 완료 후, 구매자)
   */
  async consumerKakaoRegisterWithPhone(dto: KakaoRegisterRequestDto) {
    return this.authKakaoOauthService.consumerKakaoRegisterWithPhone(dto);
  }

  /**
   * 카카오 — Authorization Code 로그인 (판매자)
   */
  async sellerKakaoLoginWithCode(dto: KakaoLoginRequestDto) {
    return this.authKakaoOauthService.sellerKakaoLoginWithCode(dto);
  }

  /**
   * 카카오 — 회원가입·최초 연동 (휴대폰 인증 완료 후, 판매자)
   */
  async sellerKakaoRegisterWithPhone(dto: KakaoRegisterRequestDto) {
    return this.authKakaoOauthService.sellerKakaoRegisterWithPhone(dto);
  }

  /**
   * 구매자 액세스 토큰이 가드·전략을 통과했을 때의 확인 응답 (DB 조회 없음)
   */
  getCurrentUser(user: JwtVerifiedPayload): SessionAvailabilityResponse {
    void user.sub;
    return this.getSessionAvailabilityResponse();
  }

  /**
   * 판매자 액세스 토큰이 가드·전략을 통과했을 때의 확인 응답 (DB 조회 없음)
   */
  getCurrentSeller(user: JwtVerifiedPayload): SessionAvailabilityResponse {
    void user.sub;
    return this.getSessionAvailabilityResponse();
  }

  /**
   * 계정 찾기 (구매자) — 발송/확인 시 `audience: consumer`, `purpose: find_account`로 인증 완료 후 호출
   */
  async findAccountConsumer(dto: FindAccountRequestDto) {
    return this.authAccountFindService.findAccount(dto, AUDIENCE.CONSUMER);
  }

  /**
   * 계정 찾기 (판매자) — 발송/확인 시 `audience: seller`, `purpose: find_account`로 인증 완료 후 호출
   */
  async findAccountSeller(dto: FindAccountRequestDto) {
    return this.authAccountFindService.findAccount(dto, AUDIENCE.SELLER);
  }

  /**
   * 휴대폰 인증번호 발송
   * `audience`(consumer | seller)와 `purpose`(종류)를 함께 보내면 DB에는 `consumer:google_registration` 형태로 저장됩니다.
   */
  async sendVerificationCode(dto: SendVerificationCodeRequestDto) {
    return await this.authPhoneService.sendVerificationCode(dto);
  }

  /**
   * 휴대폰 인증번호 확인 — 발송 시와 동일한 `audience`·`purpose`를 전달해야 합니다.
   */
  async verifyPhoneCode(dto: VerifyPhoneCodeRequestDto) {
    await this.authPhoneService.verifyPhoneCode(dto);
  }

  /**
   * 헤더 기반 인증 — 클라이언트에서 토큰 삭제로 처리; 서버는 동작 없음
   */
  logout(): void {
    // 헤더 기반 인증에서는 클라이언트에서 토큰을 삭제하면 되므로 서버에서는 별도 처리 불필요
  }

  /**
   * 관리자 회원가입 - ID·비밀번호
   */
  async adminRegister(dto: AdminRegisterRequestDto) {
    return this.authAdminService.register(dto);
  }

  /**
   * 관리자 로그인 — Google OTP 미등록이면 `totpSetupPendingToken`, 등록된 계정이면 `totpPendingToken` 후 `adminVerifyTotpLogin`으로 최종 토큰 발급
   */
  async adminLogin(dto: AdminLoginRequestDto) {
    return this.authAdminService.login(dto);
  }

  /**
   * 관리자 로그인 2단계 — TOTP 코드 검증 후 토큰 쌍 발급
   */
  async adminVerifyTotpLogin(dto: AdminTotpVerifyLoginRequestDto) {
    return this.authAdminService.verifyTotpLogin(dto);
  }

  /**
   * 관리자 Google OTP 설정 시작 - QR·secret
   */
  async adminSetupTotp(adminId: string) {
    return this.authAdminService.setupTotp(adminId);
  }

  /**
   * 관리자 Google OTP 활성화 - 코드 확인
   */
  async adminEnableTotp(adminId: string, dto: AdminTotpEnableRequestDto) {
    return this.authAdminService.enableTotp(adminId, dto);
  }

  /**
   * 관리자 액세스 토큰이 가드·전략을 통과했을 때의 확인 응답 - DB 조회 없음
   */
  getCurrentAdmin(user: JwtVerifiedPayload): SessionAvailabilityResponse {
    return this.authAdminService.getSessionAvailability(user);
  }
}
