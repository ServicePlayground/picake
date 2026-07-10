import { Injectable } from "@nestjs/common";
import { SolapiService } from "@apps/backend/modules/solapi/solapi.service";
import { LoggerUtil } from "@apps/backend/common/utils/logger.util";
import { SentryUtil } from "@apps/backend/common/utils/sentry.util";

/**
 * 주문 상태 알림용 구매자 카카오 알림톡 발송 서비스.
 * 공용 `SolapiService`를 이용하며, 주문 알림 전용 기본값(SMS 대체 발송 비활성화)을 캡슐화합니다.
 *
 * - SOLAPI 환경변수 미설정 시 `SolapiService`가 에러를 던지며, 호출자로 전파합니다.
 * - API 발송 실패(수신 불가·템플릿 오류 등)는 보조 채널이므로 로깅만 하고 주문 흐름을 막지 않습니다.
 */
@Injectable()
export class ConsumerOrderAlimtalkService {
  constructor(private readonly solapiService: SolapiService) {}

  /**
   * 구매자에게 주문 알림톡을 발송합니다.
   */
  async sendOrderAlimtalk(params: {
    to: string;
    templateId: string;
    variables: Record<string, string>;
    orderId: string;
  }): Promise<void> {
    if (!this.solapiService.isAlimtalkEnabled) {
      LoggerUtil.log(
        `[ConsumerOrderAlimtalkService] SOLAPI_PFID 미설정 — 알림톡 발송 생략 order=${params.orderId}`,
      );
      return;
    }

    try {
      await this.solapiService.sendAlimtalk({
        to: params.to,
        templateId: params.templateId,
        variables: params.variables,
        // 주문 알림톡 실패 시에도 Socket.IO·FCM·DB로 이미 전달되므로 SMS 대체 발송은 하지 않음
        disableSms: true,
      });
    } catch (e) {
      if (ConsumerOrderAlimtalkService.isConfigurationError(e)) {
        throw e;
      }

      LoggerUtil.log(
        `[ConsumerOrderAlimtalkService] 발송 실패 order=${params.orderId}: ${e instanceof Error ? e.message : String(e)}`,
      );
      SentryUtil.captureException(e, "error", {
        module: "consumer-order-alimtalk",
        operation: "send-order-alimtalk",
        orderId: params.orderId,
      });
    }
  }

  /** SOLAPI 환경변수 미설정 등 구성 오류 여부 */
  private static isConfigurationError(e: unknown): boolean {
    const message = e instanceof Error ? e.message : String(e);
    return message.includes("미설정") || message.includes("설정되지 않");
  }
}
