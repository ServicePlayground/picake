import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "@apps/backend/infra/database/database.module";
import { ChatModule } from "@apps/backend/modules/chat/chat.module";
import { AiAssistantService } from "./ai-assistant.service";
import { AiAssistantConfigService } from "./services/ai-assistant-config.service";
import { AiContextBuildService } from "./services/ai-context-build.service";
import { AiResponseGenerateService } from "./services/ai-response-generate.service";
import { AiUnansweredQuestionCaptureService } from "./services/ai-unanswered-question-capture.service";
import { AiHandoffSweepService } from "./services/ai-handoff-sweep.service";

/**
 * AI 자동응답 모듈
 *
 * 판매자가 등록한 지침·FAQ와 스토어 실데이터(영업시간·환불정책)를 근거로
 * 구매자 문의에 AI가 1차 응답합니다.
 *
 * 의존 방향은 AiAssistantModule → ChatModule 단방향입니다. 채팅 쪽에서 AI를 트리거할 때는
 * ChatMessageHookRegistry에 이 모듈이 자신을 등록하는 방식으로 역참조를 피합니다.
 */
@Module({
  imports: [DatabaseModule, ConfigModule, ChatModule],
  providers: [
    AiAssistantService,
    AiAssistantConfigService,
    AiContextBuildService,
    AiResponseGenerateService,
    AiUnansweredQuestionCaptureService,
    AiHandoffSweepService,
  ],
  exports: [AiAssistantService, AiAssistantConfigService],
})
export class AiAssistantModule {}
