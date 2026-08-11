import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { Auth } from "@apps/backend/modules/auth/decorators/auth.decorator";
import { SwaggerResponse } from "@apps/backend/common/decorators/swagger-response.decorator";
import { SwaggerAuthResponses } from "@apps/backend/common/decorators/swagger-auth-responses.decorator";
import { createMessageObject } from "@apps/backend/common/utils/message.util";
import { JwtVerifiedPayload } from "@apps/backend/modules/auth/types/auth.types";
import { AUDIENCE } from "@apps/backend/modules/auth/constants/auth.constants";
import { AiAssistantConfigService } from "@apps/backend/modules/ai-assistant/services/ai-assistant-config.service";
import { AI_ASSISTANT_ERROR_MESSAGES } from "@apps/backend/modules/ai-assistant/constants/ai-assistant.constants";
import {
  UpdateAiAssistantSettingsRequestDto,
  UpsertAiFaqRequestDto,
  UpdateAiFaqRequestDto,
  ConvertToFaqRequestDto,
  AiPreviewTestRequestDto,
} from "@apps/backend/modules/ai-assistant/dto/ai-assistant.dto";

/**
 * AI 자동응답 설정 컨트롤러 (판매자용)
 * 응대 지침, FAQ, 미답변 질문, 미리테스트, 대시보드 통계를 관리합니다.
 */
@ApiTags("AI 자동응답")
@Controller(`${AUDIENCE.SELLER}/store/:storeId/ai-assistant`)
@Auth({ isPublic: false, audiences: ["seller"] })
export class SellerAiAssistantController {
  constructor(private readonly aiAssistantConfigService: AiAssistantConfigService) {}

  @Get("settings")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) AI 자동응답 설정 조회",
    description:
      "응대 지침·사용 시간대 설정과 매장 정보 연동 상태를 조회합니다. 설정이 없으면(configured=false) AI가 동작하지 않습니다(opt-in).",
  })
  @SwaggerAuthResponses()
  @SwaggerResponse(404, {
    dataExample: createMessageObject(AI_ASSISTANT_ERROR_MESSAGES.STORE_NOT_FOUND),
  })
  async getSettings(@Param("storeId") storeId: string, @Request() req: { user: JwtVerifiedPayload }) {
    return await this.aiAssistantConfigService.getSettings(storeId, req.user.sub);
  }

  @Put("settings")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) AI 자동응답 설정 저장",
    description:
      "응대 지침과 사용 시간대를 저장합니다. 최초 생성 시 사용 시간대 기본값은 OFF — 시간대까지 저장해야 AI가 켜집니다.",
  })
  @SwaggerAuthResponses()
  async updateSettings(
    @Param("storeId") storeId: string,
    @Body() dto: UpdateAiAssistantSettingsRequestDto,
    @Request() req: { user: JwtVerifiedPayload },
  ) {
    return await this.aiAssistantConfigService.updateSettings(storeId, req.user.sub, dto);
  }

  @Post("instructions-draft")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 매장 정보로 응대 지침 초안 생성",
    description:
      "매장 소개·영업시간·환불정책을 근거로 AI가 지침 초안을 생성해 반환합니다. 저장하지 않습니다(부작용 없음).",
  })
  @SwaggerAuthResponses()
  async generateInstructionsDraft(
    @Param("storeId") storeId: string,
    @Request() req: { user: JwtVerifiedPayload },
  ) {
    return await this.aiAssistantConfigService.generateInstructionsDraft(storeId, req.user.sub);
  }

  @Post("test")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 저장 전 미리테스트",
    description:
      "실제 채팅방을 만들지 않고 AI 응답을 시뮬레이션합니다. 미답변 질문 기록·통계에 반영되지 않습니다.",
  })
  @SwaggerAuthResponses()
  async testReply(
    @Param("storeId") storeId: string,
    @Body() dto: AiPreviewTestRequestDto,
    @Request() req: { user: JwtVerifiedPayload },
  ) {
    return await this.aiAssistantConfigService.testReply(storeId, req.user.sub, dto);
  }

  // ---------------- FAQ ----------------

  @Get("faqs")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "(로그인 필요) FAQ 목록 조회" })
  @SwaggerAuthResponses()
  async getFaqs(@Param("storeId") storeId: string, @Request() req: { user: JwtVerifiedPayload }) {
    return await this.aiAssistantConfigService.getFaqs(storeId, req.user.sub);
  }

  @Post("faqs")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "(로그인 필요) FAQ 등록" })
  @SwaggerAuthResponses()
  async createFaq(
    @Param("storeId") storeId: string,
    @Body() dto: UpsertAiFaqRequestDto,
    @Request() req: { user: JwtVerifiedPayload },
  ) {
    return await this.aiAssistantConfigService.createFaq(storeId, req.user.sub, dto);
  }

  @Patch("faqs/:faqId")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "(로그인 필요) FAQ 수정" })
  @SwaggerAuthResponses()
  async updateFaq(
    @Param("storeId") storeId: string,
    @Param("faqId") faqId: string,
    @Body() dto: UpdateAiFaqRequestDto,
    @Request() req: { user: JwtVerifiedPayload },
  ) {
    return await this.aiAssistantConfigService.updateFaq(storeId, req.user.sub, faqId, dto);
  }

  @Delete("faqs/:faqId")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "(로그인 필요) FAQ 삭제" })
  @SwaggerAuthResponses()
  async deleteFaq(
    @Param("storeId") storeId: string,
    @Param("faqId") faqId: string,
    @Request() req: { user: JwtVerifiedPayload },
  ) {
    return await this.aiAssistantConfigService.deleteFaq(storeId, req.user.sub, faqId);
  }

  // ---------------- 미답변 질문 (FAQ 자동 제안) ----------------

  @Get("unanswered-questions")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 자주 나온 질문 조회",
    description: "AI가 답하지 못해 사람에게 넘어간 질문 목록입니다. 판매자 답변이 캡처된 경우 초안으로 함께 제공됩니다.",
  })
  @SwaggerAuthResponses()
  async getUnansweredQuestions(
    @Param("storeId") storeId: string,
    @Request() req: { user: JwtVerifiedPayload },
  ) {
    return await this.aiAssistantConfigService.getUnansweredQuestions(storeId, req.user.sub);
  }

  @Post("unanswered-questions/:questionId/convert-to-faq")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "(로그인 필요) 미답변 질문을 FAQ로 등록" })
  @SwaggerAuthResponses()
  async convertToFaq(
    @Param("storeId") storeId: string,
    @Param("questionId") questionId: string,
    @Body() dto: ConvertToFaqRequestDto,
    @Request() req: { user: JwtVerifiedPayload },
  ) {
    return await this.aiAssistantConfigService.convertToFaq(
      storeId,
      req.user.sub,
      questionId,
      dto.answer,
    );
  }

  @Post("unanswered-questions/:questionId/dismiss")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "(로그인 필요) 미답변 질문 무시" })
  @SwaggerAuthResponses()
  async dismissUnansweredQuestion(
    @Param("storeId") storeId: string,
    @Param("questionId") questionId: string,
    @Request() req: { user: JwtVerifiedPayload },
  ) {
    return await this.aiAssistantConfigService.dismissUnansweredQuestion(
      storeId,
      req.user.sub,
      questionId,
    );
  }

  // ---------------- 통계 ----------------

  @Get("stats")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) AI 처리 현황 통계",
    description:
      "AI 자동응답 건수, 사람 이관 건수, 만족도, AI vs 사람 평균 응답시간, 일별 처리량을 조회합니다.",
  })
  @ApiQuery({ name: "days", required: false, description: "집계 기간(일), 기본 7" })
  @SwaggerAuthResponses()
  async getStats(
    @Param("storeId") storeId: string,
    @Query("days") days: string | undefined,
    @Request() req: { user: JwtVerifiedPayload },
  ) {
    const rangeDays = Math.min(Math.max(Number.parseInt(days ?? "7", 10) || 7, 1), 90);
    return await this.aiAssistantConfigService.getStats(storeId, req.user.sub, rangeDays);
  }
}
