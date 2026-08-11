import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Request,
  Query,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiExtraModels } from "@nestjs/swagger";
import { ChatService } from "@apps/backend/modules/chat/chat.service";
import { Auth } from "@apps/backend/modules/auth/decorators/auth.decorator";
import { SwaggerResponse } from "@apps/backend/common/decorators/swagger-response.decorator";
import { SwaggerAuthResponses } from "@apps/backend/common/decorators/swagger-auth-responses.decorator";
import { createMessageObject } from "@apps/backend/common/utils/message.util";
import { AuthenticatedUser, JwtVerifiedPayload } from "@apps/backend/modules/auth/types/auth.types";
import { AUDIENCE } from "@apps/backend/modules/auth/constants/auth.constants";
import { CHAT_ERROR_MESSAGES } from "@apps/backend/modules/chat/constants/chat.constants";
import {
  ChatRoomListForSellerResponseDto,
  ChatRoomForSellerResponseDto,
} from "@apps/backend/modules/chat/dto/chat-room-list.dto";
import { MessageListResponseDto } from "@apps/backend/modules/chat/dto/chat-message-list.dto";
import { PaginationRequestDto } from "@apps/backend/common/dto/pagination-request.dto";
import { AiAssistantService } from "@apps/backend/modules/ai-assistant/ai-assistant.service";
import { ToggleAiRequestDto } from "@apps/backend/modules/ai-assistant/dto/ai-assistant.dto";

/**
 * 채팅 관련 컨트롤러 (판매자용)
 * 채팅방과 메시지 관리를 통합적으로 처리합니다.
 */
@ApiTags("채팅")
@ApiExtraModels(
  ChatRoomListForSellerResponseDto,
  ChatRoomForSellerResponseDto,
  MessageListResponseDto,
)
@Controller(`${AUDIENCE.SELLER}/chat-room`)
@Auth({ isPublic: false, audiences: ["seller"] }) // 판매자 JWT(aud: seller)만 허용
export class SellerChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly aiAssistantService: AiAssistantService,
  ) {}

  /**
   * 스토어의 채팅방 목록 조회 API
   * 특정 스토어의 모든 채팅방 목록을 조회합니다.
   */
  @Get("store/:storeId")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 스토어의 채팅방 목록 조회",
    description:
      "특정 스토어의 모든 채팅방 목록을 조회합니다. 마지막 메시지 시간 기준으로 정렬됩니다. 자신이 소유한 스토어만 조회 가능합니다. 페이지네이션을 지원합니다.",
  })
  @SwaggerResponse(200, { dataDto: ChatRoomListForSellerResponseDto })
  @SwaggerAuthResponses()
  @SwaggerResponse(403, {
    dataExample: createMessageObject(CHAT_ERROR_MESSAGES.STORE_NOT_OWNED),
  })
  @SwaggerResponse(404, { dataExample: createMessageObject(CHAT_ERROR_MESSAGES.STORE_NOT_FOUND) })
  async getChatRoomsByStore(
    @Param("storeId") storeId: string,
    @Request() req: { user: JwtVerifiedPayload },
    @Query() query: PaginationRequestDto,
  ) {
    return await this.chatService.getChatRoomsByStoreIdForSeller(storeId, req.user.sub, query);
  }

  /**
   * 채팅방 읽음 처리 API (판매자용)
   * 채팅방 입장 시 판매자의 읽지 않은 메시지 수를 초기화합니다.
   */
  @Post(":roomId/read")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 채팅방 읽음 처리",
    description: "채팅방 입장 시 판매자의 읽지 않은 메시지 수를 0으로 초기화합니다.",
  })
  @SwaggerResponse(200, { dataExample: { success: true } })
  @SwaggerAuthResponses()
  @SwaggerResponse(404, {
    dataExample: createMessageObject(CHAT_ERROR_MESSAGES.CHAT_ROOM_NOT_FOUND),
  })
  async markAsRead(@Param("roomId") roomId: string, @Request() req: { user: AuthenticatedUser }) {
    return await this.chatService.markChatRoomAsRead(roomId, req.user.sub, "store");
  }

  /**
   * 메시지 목록 조회 API
   */
  @Get(":roomId/messages")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 메시지 목록 조회",
    description: "채팅방의 메시지 목록을 조회합니다. 페이지 기반 페이지네이션을 지원합니다.",
  })
  @SwaggerResponse(200, { dataDto: MessageListResponseDto })
  @SwaggerAuthResponses()
  @SwaggerResponse(404, {
    dataExample: createMessageObject(CHAT_ERROR_MESSAGES.CHAT_ROOM_NOT_FOUND),
  })
  async getMessages(
    @Param("roomId") roomId: string,
    @Query() query: PaginationRequestDto,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return await this.chatService.getMessages(roomId, req.user.sub, "store", query);
  }

  /**
   * 방의 AI 자동응답 상태 조회 API (응대중 토글 초기값)
   */
  @Get(":roomId/ai-state")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 채팅방 AI 자동응답 상태 조회",
    description: "이 채팅방에서 AI 자동응답이 켜져 있는지 조회합니다. 응대중 토글의 초기 상태로 사용합니다.",
  })
  @SwaggerResponse(200, { dataExample: { aiEnabled: true } })
  @SwaggerAuthResponses()
  async getAiState(@Param("roomId") roomId: string, @Request() req: { user: JwtVerifiedPayload }) {
    return await this.aiAssistantService.getRoomAiState(roomId, req.user.sub);
  }

  /**
   * 응대중 토글 API — 이 방만 AI 자동응답 on/off
   */
  @Patch(":roomId/ai-toggle")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 응대중 토글 (방 단위 AI on/off)",
    description:
      "이 채팅방의 AI 자동응답을 켜거나 끕니다. 끄면 직접 응대 모드가 되고 다른 채팅방에는 영향을 주지 않습니다.",
  })
  @SwaggerResponse(200, { dataExample: { aiEnabled: false } })
  @SwaggerAuthResponses()
  @SwaggerResponse(404, {
    dataExample: createMessageObject(CHAT_ERROR_MESSAGES.CHAT_ROOM_NOT_FOUND),
  })
  async toggleAi(
    @Param("roomId") roomId: string,
    @Body() dto: ToggleAiRequestDto,
    @Request() req: { user: JwtVerifiedPayload },
  ) {
    return await this.aiAssistantService.toggleAi(roomId, req.user.sub, dto.enabled);
  }
}
