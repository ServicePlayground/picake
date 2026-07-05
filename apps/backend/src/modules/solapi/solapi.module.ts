import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { SolapiService } from "@apps/backend/modules/solapi/solapi.service";
import { ConsumerOrderAlimtalkService } from "@apps/backend/modules/solapi/services/consumer-order-alimtalk.service";

/**
 * SOLAPI 메시징 모듈 (SMS·카카오 알림톡)
 * - SolapiService: SMS·알림톡 공통 발송 래퍼 (저수준, 미설정·실패 시 예외)
 * - ConsumerOrderAlimtalkService: 주문 알림톡 발송 (환경변수 미설정 시 에러, API 실패 시 로깅만)
 * - 환경변수 미설정 시 발송 시 에러를 던집니다 (호출 측에서 발송 생략·실패 허용을 결정).
 */
@Module({
  imports: [ConfigModule],
  providers: [SolapiService, ConsumerOrderAlimtalkService],
  exports: [SolapiService, ConsumerOrderAlimtalkService],
})
export class SolapiModule {}
