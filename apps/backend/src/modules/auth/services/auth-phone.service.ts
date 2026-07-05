import { Injectable, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import { PhoneUtil } from "@apps/backend/modules/auth/utils/phone.util";
import {
  AUTH_ERROR_MESSAGES,
  AudienceConst,
  PHONE_VERIFICATION_CODE_EXPIRY_MINUTES,
  PhoneVerificationPurpose,
} from "@apps/backend/modules/auth/constants/auth.constants";
import {
  SendVerificationCodeRequestDto,
  VerifyPhoneCodeRequestDto,
} from "@apps/backend/modules/auth/dto/auth-phone-verification.dto";
import { AuthSmsService } from "@apps/backend/modules/auth/services/auth-sms.service";
import { LoggerUtil } from "@apps/backend/common/utils/logger.util";

/** 인증 완료 후 다음 단계(구글 가입·계정 찾기 등)에 사용할 수 있는 유효 시간 */
const VERIFIED_PURPOSE_VALID_MS = 60 * 60 * 1000;

/**
 * 휴대폰 인증 (발송·확인·상태 조회)
 */
@Injectable()
export class AuthPhoneService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authSmsService: AuthSmsService,
    private readonly configService: ConfigService,
  ) {}

  /** 개발 환경 여부 */
  private get isDevelopment(): boolean {
    return this.configService.get<string>("NODE_ENV") === "development";
  }

  /**
   * 휴대폰 인증번호 발송
   *
   * @param sendCodeDto 휴대폰 번호와 인증 목적
   * @throws BadRequestException 잘못된 휴대폰 번호 형식이거나 재발송 제한에 걸린 경우
   */
  async sendVerificationCode(
    sendCodeDto: SendVerificationCodeRequestDto,
  ): Promise<{ expiresAt: Date }> {
    const { phone, audience, purpose: kind } = sendCodeDto;
    const normalizedPhone = PhoneUtil.normalizePhone(phone);
    const storedPurpose = PhoneUtil.composeStoredPhoneVerificationPurpose(audience, kind);

    // 1. 인증번호 생성
    const verificationCode = PhoneUtil.generateVerificationCode();
    const expiresAt = PhoneUtil.getExpirationTime(PHONE_VERIFICATION_CODE_EXPIRY_MINUTES);

    // 2. 트랜잭션으로 인증 정보 저장 - PhoneVerification 테이블
    await this.prisma.$transaction(
      async (tx) => {
        // 기존 미인증 레코드 삭제 (같은 목적의 인증코드만 삭제하여 다른 목적의 인증코드는 유지)
        await tx.phoneVerification.deleteMany({
          where: {
            phone: normalizedPhone,
            purpose: storedPurpose,
            isVerified: false,
          },
        });

        // 새 인증 정보 생성
        await tx.phoneVerification.create({
          data: {
            phone: normalizedPhone,
            verificationCode,
            expiresAt,
            purpose: storedPurpose,
          },
        });
      },
      {
        maxWait: 5000, // 최대 대기 시간 (5초)
        timeout: 10000, // 타임아웃 (10초)
      },
    );

    // 3. SMS 발송 (SOLAPI) — 개발 환경에서는 비용 때문에 발송하지 않음
    if (!this.isDevelopment) {
      await this.authSmsService.sendVerificationCode(normalizedPhone, verificationCode);
    }

    return { expiresAt };
  }

  /**
   * 휴대폰 인증번호 확인
   *
   * @param verifyCodeDto 휴대폰 번호, 인증번호, 인증 목적
   * @throws BadRequestException 인증번호가 잘못되었거나 만료되었거나 시도 횟수를 초과한 경우
   */
  async verifyPhoneCode(verifyCodeDto: VerifyPhoneCodeRequestDto): Promise<void> {
    const { phone, verificationCode, audience, purpose: kind } = verifyCodeDto;
    const normalizedPhone = PhoneUtil.normalizePhone(phone);
    const storedPurpose = PhoneUtil.composeStoredPhoneVerificationPurpose(audience, kind);

    // 개발 환경에서는 인증 통과
    if (this.isDevelopment && verificationCode === "777777") {
      const existingVerification = await this.prisma.phoneVerification.findFirst({
        where: {
          phone: normalizedPhone,
          purpose: storedPurpose,
          isVerified: false, // 인증되지 않은 레코드만 조회
        },
        orderBy: { createdAt: "desc" }, // 가장 최근 순 정렬
      });

      // 인증 정보가 존재하지 않는 경우
      if (!existingVerification) {
        LoggerUtil.log(
          `휴대폰 인증 실패: 인증 정보 없음 - phone: ${normalizedPhone}, purpose: ${storedPurpose}`,
        );
        throw new BadRequestException(AUTH_ERROR_MESSAGES.PHONE_VERIFICATION_FAILED);
      }

      // 2. 만료 시간 확인 - 5분 후 자동 만료
      if (existingVerification.expiresAt < new Date()) {
        LoggerUtil.log(
          `휴대폰 인증 실패: 인증번호 만료 - phone: ${normalizedPhone}, purpose: ${storedPurpose}, expiresAt: ${existingVerification.expiresAt}`,
        );
        throw new BadRequestException(AUTH_ERROR_MESSAGES.PHONE_VERIFICATION_EXPIRED);
      }

      await this.prisma.$transaction(
        async (tx) => {
          await tx.phoneVerification.update({
            where: { id: existingVerification.id },
            data: {
              isVerified: true, // is_verified 플래그로 본인인증 상태 관리
            },
          });
        },
        {
          maxWait: 5000, // 최대 대기 시간 (5초)
          timeout: 10000, // 타임아웃 (10초)
        },
      );
      return;
    }

    // 1. 휴대폰 번호, 인증번호, 목적으로 검증 정보 조회 - PhoneVerification 테이블
    // 인증되지 않은 레코드 중에서 가장 최근 것을 찾음
    const phoneVerification = await this.prisma.phoneVerification.findFirst({
      where: {
        phone: normalizedPhone,
        verificationCode,
        purpose: storedPurpose,
        isVerified: false, // 인증되지 않은 레코드만 조회
      },
      orderBy: { createdAt: "desc" }, // 가장 최근 순 정렬
    });

    // 인증 정보가 존재하지 않는 경우
    if (!phoneVerification) {
      LoggerUtil.log(
        `휴대폰 인증 실패: 인증 정보 없음 - phone: ${normalizedPhone}, purpose: ${storedPurpose}, verificationCode: ${verificationCode}`,
      );
      throw new BadRequestException(AUTH_ERROR_MESSAGES.PHONE_VERIFICATION_FAILED);
    }

    // 2. 만료 시간 확인 - 5분 후 자동 만료
    if (phoneVerification.expiresAt < new Date()) {
      LoggerUtil.log(
        `휴대폰 인증 실패: 인증번호 만료 - phone: ${normalizedPhone}, purpose: ${storedPurpose}, expiresAt: ${phoneVerification.expiresAt}`,
      );
      throw new BadRequestException(AUTH_ERROR_MESSAGES.PHONE_VERIFICATION_EXPIRED);
    }

    // 3. 인증 성공 처리 - 트랜잭션으로 안전하게 처리
    await this.prisma.$transaction(
      async (tx) => {
        // 현재 인증을 완료 상태로 업데이트
        await tx.phoneVerification.update({
          where: { id: phoneVerification.id },
          data: {
            isVerified: true, // is_verified 플래그로 본인인증 상태 관리
          },
        });
      },
      {
        maxWait: 5000, // 최대 대기 시간 (5초)
        timeout: 10000, // 타임아웃 (10초)
      },
    );
  }

  /**
   * 휴대폰 인증 상태 확인
   *
   * `verifyPhoneCode`로 `isVerified: true`가 된 뒤, 그 시점(`updatedAt`)으로부터
   * 1시간 이내에만 유효한 것으로 봅니다 (`VERIFIED_PURPOSE_VALID_MS`와 동일).
   * (코드 입력 단계의 유효성은 `verifyPhoneCode`에서 `expiresAt`으로 검증합니다.)
   *
   * @param phone 휴대폰 번호
   * @param audience 인증 주체 (consumer | seller)
   * @param kind 인증 종류 (`PhoneVerificationPurpose`)
   * @returns 인증 상태 유효 여부
   */
  async checkPhoneVerificationStatus(
    phone: string,
    audience: AudienceConst,
    kind: PhoneVerificationPurpose,
  ): Promise<boolean> {
    const normalizedPhone = PhoneUtil.normalizePhone(phone);
    const validSince = new Date(Date.now() - VERIFIED_PURPOSE_VALID_MS);
    const composed = PhoneUtil.composeStoredPhoneVerificationPurpose(audience, kind);

    const phoneVerification = await this.prisma.phoneVerification.findFirst({
      where: {
        phone: normalizedPhone,
        purpose: composed,
        isVerified: true,
        updatedAt: { gte: validSince },
      },
      orderBy: { updatedAt: "desc" },
    });

    return !!phoneVerification;
  }
}
