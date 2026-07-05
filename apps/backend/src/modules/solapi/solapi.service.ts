import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SolapiMessageService } from "solapi";
import { LoggerUtil } from "@apps/backend/common/utils/logger.util";
import { SentryUtil } from "@apps/backend/common/utils/sentry.util";
import {
  SendAlimtalkParams,
  SendAlimtalkResult,
  SendSmsParams,
  SendSmsResult,
} from "@apps/backend/modules/solapi/types/solapi.types";

/**
 * SOLAPI 메시지 발송 래퍼 (SMS·카카오 알림톡 공통).
 *
 * - SMS·알림톡은 동일한 SOLAPI 클라이언트·발신번호를 공유하므로 한 곳에서 관리합니다.
 * - 환경변수 (`SOLAPI_API_KEY` / `SOLAPI_API_SECRET` / `SOLAPI_SENDER_PHONE` / `SOLAPI_PFID`)
 *   미설정 시 초기화되지 않으며, 발송 시 에러를 던집니다.
 * - 발신번호(`from`)·발신 프로필(`pfId`)은 SOLAPI 콘솔에 사전 등록·인증되어 있어야 합니다.
 * - 저수준 발송기로, 미설정·실패 시 예외를 던집니다. 발송 생략·실패 허용은 호출 측에서 결정합니다.
 */
@Injectable()
export class SolapiService implements OnModuleInit {
  private client: SolapiMessageService | null = null;
  private senderPhone: string | null = null;
  private pfId: string | null = null;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const apiKey = this.configService.get<string>("SOLAPI_API_KEY");
    const apiSecret = this.configService.get<string>("SOLAPI_API_SECRET");
    const senderPhone = this.configService.get<string>("SOLAPI_SENDER_PHONE");
    const pfId = this.configService.get<string>("SOLAPI_PFID");

    if (!apiKey || !apiSecret || !senderPhone) {
      LoggerUtil.log("[SolapiService] SOLAPI SMS 환경변수 미설정 — 발송 비활성화");
      SentryUtil.captureMessage(
        "[SolapiService] SOLAPI SMS 환경변수 미설정 — 발송 비활성화",
        "warning",
        {
          module: "solapi",
          operation: "init",
          status: "disabled",
        },
      );
      return;
    }

    try {
      this.client = new SolapiMessageService(apiKey, apiSecret);
      // 발신번호는 하이픈·공백을 제거한 숫자만 사용 (예: 010-1234-5678 → 01012345678)
      this.senderPhone = SolapiService.normalizePhone(senderPhone);
      this.pfId = pfId || null;
      if (!this.pfId) {
        LoggerUtil.log("[SolapiService] SOLAPI_PFID 미설정 — 알림톡만 비활성화 (SMS는 사용 가능)");
      }
      LoggerUtil.log("[SolapiService] SOLAPI 초기화 완료");
    } catch (e) {
      LoggerUtil.log(
        `[SolapiService] SOLAPI 초기화 실패: ${e instanceof Error ? e.message : String(e)}`,
      );
      SentryUtil.captureException(e, "error", {
        module: "solapi",
        operation: "init",
      });
    }
  }

  /** SMS 발송 가능 여부 (필수 환경변수 모두 설정됨) */
  get isSmsEnabled(): boolean {
    return this.client !== null && this.senderPhone !== null;
  }

  /** 알림톡 발송 가능 여부 (SMS 설정 + 발신 프로필 키) */
  get isAlimtalkEnabled(): boolean {
    return this.isSmsEnabled && this.pfId !== null;
  }

  /**
   * 단일 SMS를 발송합니다.
   *
   * @throws Error SOLAPI 환경변수 미설정으로 발송할 수 없는 경우
   */
  async sendSms(params: SendSmsParams): Promise<SendSmsResult> {
    if (!this.client || !this.senderPhone) {
      throw new Error("[SolapiService] SOLAPI 환경변수가 설정되지 않아 SMS를 발송할 수 없습니다.");
    }

    const response = await this.client.sendOne({
      to: SolapiService.normalizePhone(params.to),
      from: this.senderPhone,
      text: params.text,
    });

    return { messageId: response.messageId };
  }

  /**
   * 카카오 알림톡을 발송합니다.
   *
   * - `disableSms`가 false이고 `fallbackText`가 있으면, 알림톡 실패 시 SMS로 대체 발송됩니다.
   *
   * @throws Error SOLAPI 환경변수 미설정으로 발송할 수 없는 경우
   */
  async sendAlimtalk(params: SendAlimtalkParams): Promise<SendAlimtalkResult> {
    if (!this.isAlimtalkEnabled || !this.pfId) {
      throw new Error("[SolapiService] SOLAPI_PFID가 설정되지 않아 알림톡을 발송할 수 없습니다.");
    }

    const response = await this.client.sendOne({
      to: SolapiService.normalizePhone(params.to),
      from: this.senderPhone,
      ...(params.fallbackText ? { text: params.fallbackText } : {}),
      kakaoOptions: {
        pfId: this.pfId,
        templateId: params.templateId,
        variables: params.variables,
        disableSms: params.disableSms ?? true,
      },
    });

    return { messageId: response.messageId };
  }

  /** 하이픈·공백·괄호를 제거해 숫자만 남깁니다. */
  private static normalizePhone(phone: string): string {
    return phone.replace(/[\s\-()]/g, "");
  }
}
