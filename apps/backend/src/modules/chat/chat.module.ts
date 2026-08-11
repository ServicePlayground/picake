import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule } from "@nestjs/config";
import { ChatMessageHookRegistry } from "@apps/backend/modules/chat/services/chat-message-hook.registry";
import { ChatService } from "@apps/backend/modules/chat/chat.service";
import { ChatRoomCreateService } from "@apps/backend/modules/chat/services/chat-room-create.service";
import { ChatRoomListService } from "@apps/backend/modules/chat/services/chat-room-list.service";
import { ChatRoomDetailService } from "@apps/backend/modules/chat/services/chat-room-detail.service";
import { ChatRoomUpdateService } from "@apps/backend/modules/chat/services/chat-room-update.service";
import { ChatMessageCreateService } from "@apps/backend/modules/chat/services/chat-message-create.service";
import { ChatMessageListService } from "@apps/backend/modules/chat/services/chat-message-list.service";
import { ChatGateway } from "@apps/backend/modules/chat/gateways/chat.gateway";
import { DatabaseModule } from "@apps/backend/infra/database/database.module";

/**
 * 채팅 관련 모듈
 *
 * 채팅방과 메시지 관리를 통합적으로 처리합니다.
 * - ChatService: Facade 패턴으로 통합 인터페이스 제공
 * - CRUD 서비스들: 채팅방 및 메시지 관련 비즈니스 로직
 * - ChatGateway: WebSocket 실시간 통신
 */
@Module({
  imports: [DatabaseModule, JwtModule, ConfigModule],
  providers: [
    ChatService,
    ChatRoomCreateService,
    ChatRoomListService,
    ChatRoomDetailService,
    ChatRoomUpdateService,
    ChatMessageCreateService,
    ChatMessageListService,
    ChatMessageHookRegistry,
    ChatGateway,
  ],
  exports: [ChatService, ChatGateway, ChatMessageCreateService, ChatMessageHookRegistry],
})
export class ChatModule {}
