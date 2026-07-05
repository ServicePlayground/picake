import { Injectable, BadRequestException } from "@nestjs/common";
import { SolapiService } from "@apps/backend/modules/solapi/solapi.service";
import {
  AUTH_ERROR_MESSAGES,
  buildPhoneVerificationSmsText,
} from "@apps/backend/modules/auth/constants/auth.constants";
import { PhoneUtil } from "@apps/backend/modules/auth/utils/phone.util";
import { LoggerUtil } from "@apps/backend/common/utils/logger.util";
import { SentryUtil } from "@apps/backend/common/utils/sentry.util";

/**
 * 인증번호 SMS 발송 전용 서비스.
 * 공용 `SolapiService`를 이용해 휴대폰 인증 문구를 구성·발송합니다.
 */
@Injectable()
export class AuthSmsService {
  constructor(private readonly solapiService: SolapiService) {}

  /**
   * 휴대폰 인증번호를 SMS로 발송합니다.
   *
   * - SOLAPI 환경변수 미설정·발송 실패 시 `BadRequestException`을 던져
   *   호출자가 재시도 안내를 할 수 있게 합니다.
   *
   * @param phone 정규화된 수신번호 (숫자만)
   * @param code 6자리 인증번호
   */
  async sendVerificationCode(phone: string, code: string): Promise<void> {
    try {
      await this.solapiService.sendSms({
        to: phone,
        text: buildPhoneVerificationSmsText(code),
      });
    } catch (e) {
      LoggerUtil.log(
        `[AuthSmsService] 인증번호 발송 실패 phone=${PhoneUtil.maskPhone(phone)}: ${e instanceof Error ? e.message : String(e)}`,
      );
      SentryUtil.captureException(e, "error", {
        module: "auth-sms",
        operation: "send-verification-code",
      });
      throw new BadRequestException(AUTH_ERROR_MESSAGES.PHONE_VERIFICATION_SEND_FAILED);
    }
  }
}
