import { Injectable } from "@nestjs/common";
import { CreateChatRoomRequestDto } from "@apps/backend/modules/chat/dto/chat-room-create.dto";
import {
  ChatRoomResponseDto,
  ChatRoomForSellerResponseDto,
} from "@apps/backend/modules/chat/dto/chat-room-list.dto";
import { MessageListResponseDto } from "@apps/backend/modules/chat/dto/chat-message-list.dto";
import { PaginationRequestDto } from "@apps/backend/common/dto/pagination-request.dto";
import { MessageResponseDto } from "@apps/backend/modules/chat/dto/chat-message-list.dto";
import { ChatRoomCreateService } from "@apps/backend/modules/chat/services/chat-room-create.service";
import { ChatRoomListService } from "@apps/backend/modules/chat/services/chat-room-list.service";
import { ChatRoomUpdateService } from "@apps/backend/modules/chat/services/chat-room-update.service";
import { ChatMessageCreateService } from "@apps/backend/modules/chat/services/chat-message-create.service";
import { ChatMessageListService } from "@apps/backend/modules/chat/services/chat-message-list.service";

/**
 * 채팅 서비스 (Facade)
 *
 * 채팅 관련 모든 기능을 통합하여 제공하는 메인 서비스입니다.
 * CRUD 서비스들을 조합하여 사용합니다.
 */
@Injectable()
export class ChatService {
  constructor(
    private readonly chatRoomCreateService: ChatRoomCreateService,
    private readonly chatRoomListService: ChatRoomListService,
    private readonly chatRoomUpdateService: ChatRoomUpdateService,
    private readonly chatMessageCreateService: ChatMessageCreateService,
    private readonly chatMessageListService: ChatMessageListService,
  ) {}

  /**
   * 채팅방 생성 또는 조회 (사용자용)
   */
  async createOrGetChatRoomForUser(userId: string, createChatRoomDto: CreateChatRoomRequestDto) {
    return await this.chatRoomCreateService.createOrGetChatRoomForUser(userId, createChatRoomDto);
  }

  /**
   * 사용자의 채팅방 목록 조회 (사용자용)
   */
  async getChatRoomsByUserIdForUser(
    userId: string,
    query: PaginationRequestDto,
  ): Promise<{ data: ChatRoomResponseDto[]; meta: any }> {
    return await this.chatRoomListService.getChatRoomsByUserIdForUser(userId, query);
  }

  /**
   * 스토어의 채팅방 목록 조회 (판매자용)
   */
  async getChatRoomsByStoreIdForSeller(
    storeId: string,
    userId: string,
    query: PaginationRequestDto,
  ): Promise<{ data: ChatRoomForSellerResponseDto[]; meta: any }> {
    return await this.chatRoomListService.getChatRoomsByStoreIdForSeller(storeId, userId, query);
  }

  /**
   * 채팅방 읽음 처리 (공통)
   */
  async markChatRoomAsRead(roomId: string, readerId: string, readerType: "consumer" | "store") {
    return await this.chatRoomUpdateService.markChatRoomAsRead(roomId, readerId, readerType);
  }

  /**
   * 메시지 전송 (공통)
   * @param productId - 상품 상세에서 시작된 문의의 첫 메시지에만 전달
   */
  async sendMessage(
    roomId: string,
    text: string,
    senderId: string,
    senderType: "consumer" | "store",
    productId?: string,
  ): Promise<MessageResponseDto> {
    return await this.chatMessageCreateService.sendMessage(
      roomId,
      text,
      senderId,
      senderType,
      productId,
    );
  }

  /**
   * 채팅방 메시지 목록 조회 (공통)
   */
  async getMessages(
    roomId: string,
    userId: string,
    userType: "consumer" | "store",
    query: PaginationRequestDto,
  ): Promise<MessageListResponseDto> {
    return await this.chatMessageListService.getMessages(roomId, userId, userType, query);
  }
}
