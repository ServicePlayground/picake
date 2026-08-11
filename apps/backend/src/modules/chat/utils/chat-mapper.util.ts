import { Message } from "@apps/backend/infra/database/prisma/generated/client";
import {
  ChatRoomResponseDto,
  ChatRoomForSellerResponseDto,
} from "@apps/backend/modules/chat/dto/chat-room-list.dto";
import { MessageResponseDto } from "@apps/backend/modules/chat/dto/chat-message-list.dto";
import { MessageSenderType } from "@apps/backend/modules/chat/constants/chat.constants";
import { Prisma } from "@apps/backend/infra/database/prisma/generated/client";

/**
 * 채팅 매핑 유틸리티
 * Prisma 엔티티를 응답 DTO로 변환하는 공통 로직을 제공합니다.
 */

/**
 * Store와 함께 include된 ChatRoom 타입
 * 사용자용 채팅방 목록 조회 시 사용
 */
type ChatRoomWithStore = Prisma.ChatRoomGetPayload<{
  include: {
    store: {
      select: {
        id: true;
        name: true;
        logoImageUrl: true;
      };
    };
  };
}>;

/** 판매자용 — 구매자(Consumer) 프로필 포함 */
type ChatRoomWithUser = Prisma.ChatRoomGetPayload<{
  include: {
    consumer: {
      select: {
        id: true;
        nickname: true;
        profileImageUrl: true;
      };
    };
  };
}>;

export class ChatMapperUtil {
  /**
   * Store 정보 select 필드 (채팅방 목록 조회 시 사용)
   * 사용자용 채팅방 목록에서 스토어 정보를 가져올 때 사용
   */
  static readonly STORE_INFO_SELECT = {
    id: true,
    name: true,
    logoImageUrl: true,
  } as const satisfies Prisma.StoreSelect;

  static readonly CONSUMER_INFO_SELECT = {
    id: true,
    nickname: true,
    profileImageUrl: true,
  } as const satisfies Prisma.ConsumerSelect;
  /**
   * Prisma Message 엔티티를 MessageResponseDto로 변환
   * @param message - Prisma Message 엔티티
   * @returns MessageResponseDto 객체
   */
  static mapToMessageResponseDto(message: Message): MessageResponseDto {
    return {
      id: message.id,
      roomId: message.roomId,
      text: message.text,
      senderId: message.senderId,
      senderType: message.senderType.toLowerCase() as MessageSenderType,
      isAiGenerated: message.isAiGenerated,
      aiSuggestsHandoff: message.aiSuggestsHandoff,
      aiFeedback: message.aiFeedback,
      productId: message.productId,
      relatedCustomOrderRequestId: message.relatedCustomOrderRequestId,
      createdAt: message.createdAt,
    };
  }

  /**
   * Prisma ChatRoom 엔티티를 ChatRoomResponseDto로 변환 (사용자용)
   * @param chatRoom - Prisma ChatRoom 엔티티 (store 포함)
   * @returns ChatRoomResponseDto 객체
   */
  static mapToChatRoomResponseDto(chatRoom: ChatRoomWithStore): ChatRoomResponseDto {
    return {
      id: chatRoom.id,
      store: {
        id: chatRoom.store.id,
        name: chatRoom.store.name,
        logoImageUrl: chatRoom.store.logoImageUrl,
      },
      lastMessage: chatRoom.lastMessage,
      lastMessageAt: chatRoom.lastMessageAt,
      userUnread: chatRoom.userUnread,
      storeUnread: chatRoom.storeUnread,
      createdAt: chatRoom.createdAt,
      updatedAt: chatRoom.updatedAt,
    };
  }

  static mapToChatRoomForSellerResponseDto(
    chatRoom: ChatRoomWithUser,
  ): ChatRoomForSellerResponseDto {
    return {
      id: chatRoom.id,
      user: {
        id: chatRoom.consumer.id,
        nickname: chatRoom.consumer.nickname,
        profileImageUrl: chatRoom.consumer.profileImageUrl,
      },
      lastMessage: chatRoom.lastMessage,
      lastMessageAt: chatRoom.lastMessageAt,
      userUnread: chatRoom.userUnread,
      storeUnread: chatRoom.storeUnread,
      createdAt: chatRoom.createdAt,
      updatedAt: chatRoom.updatedAt,
    };
  }
}
