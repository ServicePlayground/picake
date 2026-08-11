import {
  Controller,
  Get,
  Post,
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
import { JwtVerifiedPayload, AuthenticatedUser } from "@apps/backend/modules/auth/types/auth.types";
import { AUDIENCE } from "@apps/backend/modules/auth/constants/auth.constants";
import { CHAT_ERROR_MESSAGES } from "@apps/backend/modules/chat/constants/chat.constants";
import {
  CreateChatRoomRequestDto,
  CreateChatRoomResponseDto,
} from "@apps/backend/modules/chat/dto/chat-room-create.dto";
import {
  ChatRoomListResponseDto,
  ChatRoomResponseDto,
} from "@apps/backend/modules/chat/dto/chat-room-list.dto";
import {
  MessageListResponseDto,
  MessageResponseDto,
} from "@apps/backend/modules/chat/dto/chat-message-list.dto";
import { PaginationRequestDto } from "@apps/backend/common/dto/pagination-request.dto";
import { AiAssistantService } from "@apps/backend/modules/ai-assistant/ai-assistant.service";
import {
  SendChatMessageRequestDto,
  AiMessageFeedbackRequestDto,
} from "@apps/backend/modules/ai-assistant/dto/ai-assistant.dto";

/**
 * 채팅 관련 컨트롤러 (사용자용)
 * 채팅방과 메시지 관리를 통합적으로 처리합니다.
 */
@ApiTags("채팅")
@ApiExtraModels(
  CreateChatRoomResponseDto,
  ChatRoomListResponseDto,
  ChatRoomResponseDto,
  MessageListResponseDto,
)
@Controller(`${AUDIENCE.CONSUMER}/chat-room`)
@Auth({ isPublic: false, audiences: ["consumer"] }) // 구매자 JWT(aud: user)만 허용
export class ConsumerChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly aiAssistantService: AiAssistantService,
  ) {}

  /**
   * 채팅방 생성 또는 조회 API
   * 기존 채팅방이 있으면 반환하고, 없으면 생성합니다.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "(로그인 필요) 채팅방 생성 또는 조회",
    description:
      "스토어와의 채팅방을 생성하거나 기존 채팅방을 조회합니다. 기존 채팅방이 있으면 해당 채팅방 ID를 반환합니다.",
  })
  @SwaggerResponse(201, { dataDto: CreateChatRoomResponseDto })
  @SwaggerAuthResponses()
  @SwaggerResponse(404, { dataExample: createMessageObject(CHAT_ERROR_MESSAGES.STORE_NOT_FOUND) })
  async createOrGetChatRoom(
    @Body() createChatRoomDto: CreateChatRoomRequestDto,
    @Request() req: { user: JwtVerifiedPayload },
  ) {
    return await this.chatService.createOrGetChatRoomForUser(req.user.sub, createChatRoomDto);
  }

  /**
   * 채팅방 목록 조회 API
   * 사용자의 모든 채팅방 목록을 조회합니다.
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 채팅방 목록 조회",
    description:
      "사용자의 모든 채팅방 목록을 조회합니다. 마지막 메시지 시간 기준으로 정렬됩니다. 페이지네이션을 지원합니다.",
  })
  @SwaggerResponse(200, { dataDto: ChatRoomListResponseDto })
  @SwaggerAuthResponses()
  async getChatRooms(
    @Request() req: { user: JwtVerifiedPayload },
    @Query() query: PaginationRequestDto,
  ) {
    return await this.chatService.getChatRoomsByUserIdForUser(req.user.sub, query);
  }

  /**
   * 채팅방 읽음 처리 API
   * 채팅방 입장 시 읽지 않은 메시지 수를 초기화합니다.
   */
  @Post(":roomId/read")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 채팅방 읽음 처리",
    description: "채팅방 입장 시 사용자의 읽지 않은 메시지 수를 0으로 초기화합니다.",
  })
  @SwaggerResponse(200, { dataExample: { success: true } })
  @SwaggerAuthResponses()
  @SwaggerResponse(404, {
    dataExample: createMessageObject(CHAT_ERROR_MESSAGES.CHAT_ROOM_NOT_FOUND),
  })
  async markAsRead(@Param("roomId") roomId: string, @Request() req: { user: JwtVerifiedPayload }) {
    return await this.chatService.markChatRoomAsRead(roomId, req.user.sub, "consumer");
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
    return await this.chatService.getMessages(roomId, req.user.sub, "consumer", query);
  }

  /**
   * 메시지 전송 API (REST)
   * WebSocket send-message와 동일 경로를 타되, 상품 상세發 문의의 첫 메시지에 productId를 첨부할 수 있습니다.
   */
  @Post(":roomId/messages")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "(로그인 필요) 메시지 전송",
    description:
      "채팅방에 메시지를 전송합니다. 상품 상세에서 시작된 문의라면 productId를 함께 전달해 AI가 해당 상품 정보를 참고하게 할 수 있습니다.",
  })
  @SwaggerResponse(201, { dataDto: MessageResponseDto })
  @SwaggerAuthResponses()
  @SwaggerResponse(404, {
    dataExample: createMessageObject(CHAT_ERROR_MESSAGES.CHAT_ROOM_NOT_FOUND),
  })
  async sendMessage(
    @Param("roomId") roomId: string,
    @Body() dto: SendChatMessageRequestDto,
    @Request() req: { user: JwtVerifiedPayload },
  ) {
    return await this.chatService.sendMessage(
      roomId,
      dto.text,
      req.user.sub,
      "consumer",
      dto.productId,
    );
  }

  /**
   * 사장님 연결 요청 API (quick-reply "네, 연결해주세요" 전용)
   * AI 자동응답을 멈추고 사람 응대 모드로 전환합니다.
   */
  @Post(":roomId/request-human")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 사장님 연결 요청",
    description:
      "이 채팅방의 AI 자동응답을 멈추고 사장님이 직접 응대하는 모드로 전환합니다. 전환 즉시 연결 확인 안내가 발송됩니다.",
  })
  @SwaggerResponse(200, { dataExample: { success: true } })
  @SwaggerAuthResponses()
  @SwaggerResponse(404, {
    dataExample: createMessageObject(CHAT_ERROR_MESSAGES.CHAT_ROOM_NOT_FOUND),
  })
  async requestHuman(
    @Param("roomId") roomId: string,
    @Request() req: { user: JwtVerifiedPayload },
  ) {
    return await this.aiAssistantService.requestHuman(roomId, req.user.sub);
  }

  /**
   * AI 메시지 피드백 API (👍/👎)
   */
  @Post(":roomId/messages/:messageId/feedback")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) AI 답변 피드백",
    description: "AI가 생성한 메시지에 만족도(👍/👎)를 남깁니다. AI 답변이 아닌 메시지에는 남길 수 없습니다.",
  })
  @SwaggerResponse(200, { dataExample: { success: true } })
  @SwaggerAuthResponses()
  async setMessageFeedback(
    @Param("roomId") roomId: string,
    @Param("messageId") messageId: string,
    @Body() dto: AiMessageFeedbackRequestDto,
    @Request() req: { user: JwtVerifiedPayload },
  ) {
    return await this.aiAssistantService.setMessageFeedback(
      roomId,
      messageId,
      req.user.sub,
      dto.rating,
    );
  }
}
