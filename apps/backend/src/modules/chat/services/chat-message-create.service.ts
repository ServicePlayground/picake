import { Injectable, BadRequestException, Inject, forwardRef } from "@nestjs/common";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import { MessageResponseDto } from "@apps/backend/modules/chat/dto/chat-message-list.dto";
import { ChatRoomDetailService } from "./chat-room-detail.service";
import { ChatPermissionUtil } from "@apps/backend/modules/chat/utils/chat-permission.util";
import { ChatGateway } from "../gateways/chat.gateway";
import { ChatMapperUtil } from "@apps/backend/modules/chat/utils/chat-mapper.util";
import { Prisma } from "@apps/backend/infra/database/prisma/generated/client";
import { LoggerUtil } from "@apps/backend/common/utils/logger.util";
import { SYSTEM_SENDER_ID } from "@apps/backend/modules/chat/constants/chat.constants";
import { ChatMessageHookRegistry } from "@apps/backend/modules/chat/services/chat-message-hook.registry";

/** 내부 발신(AI/SYSTEM) 메시지 옵션 */
export interface InternalMessageOptions {
  isAiGenerated?: boolean;
  aiSuggestsHandoff?: boolean;
  productId?: string;
}

/**
 * 채팅 메시지 생성 서비스
 * 메시지 전송 관련 로직을 담당합니다.
 */
@Injectable()
export class ChatMessageCreateService {
  private static readonly MAX_MESSAGE_LENGTH = 1000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly chatRoomDetailService: ChatRoomDetailService,
    @Inject(forwardRef(() => ChatGateway)) // forwardRef: ChatGateway가 ChatMessageCreateService에서 사용되므로 순환 의존성 방지
    private readonly chatGateway: ChatGateway,
    private readonly hookRegistry: ChatMessageHookRegistry,
  ) {}

  /**
   * 메시지 전송 (공통 — 사람 발신 전용, 권한 검증 포함)
   * @param productId - 상품 상세에서 시작된 문의의 첫 메시지에만 전달 (메시지 단위 상품 컨텍스트)
   */
  async sendMessage(
    roomId: string,
    text: string,
    senderId: string,
    senderType: "consumer" | "store",
    productId?: string,
  ): Promise<MessageResponseDto> {
    // 채팅방 조회 및 권한 확인
    const chatRoom = await this.chatRoomDetailService.findChatRoomById(roomId);
    await ChatPermissionUtil.verifyChatRoomAccess(chatRoom, senderId, senderType, this.prisma);

    const messageDto = await this.persistAndBroadcast(roomId, text, senderId, senderType, {
      productId,
    });

    // AI 자동응답 훅 (fire-and-forget — 실패해도 원 메시지 전송은 성공으로 유지)
    this.hookRegistry.notifyHumanMessage(roomId, senderType, messageDto.text);

    return messageDto;
  }

  /**
   * AI/SYSTEM 메시지 발신 (내부 전용 — 권한 검증 생략)
   *
   * AI 자동응답(STORE + isAiGenerated=true)과 시스템 안내(SYSTEM)는
   * ChatPermissionUtil을 통과할 수 없으므로 이 내부 경로를 사용합니다.
   * lastMessage/unread 갱신과 WebSocket 브로드캐스트는 일반 메시지와 동일하게 처리됩니다.
   */
  async sendAiMessage(
    roomId: string,
    text: string,
    storeId: string,
    options: InternalMessageOptions = {},
  ): Promise<MessageResponseDto> {
    return await this.persistAndBroadcast(roomId, text, storeId, "store", {
      ...options,
      isAiGenerated: true,
    });
  }

  /** 시스템 안내 메시지 발신 (내부 전용 — 무응답 안내, 이관 확인 등) */
  async sendSystemMessage(
    roomId: string,
    text: string,
    options: InternalMessageOptions = {},
  ): Promise<MessageResponseDto> {
    return await this.persistAndBroadcast(roomId, text, SYSTEM_SENDER_ID, "system", options);
  }

  /**
   * 메시지 저장 + 채팅방 메타데이터 갱신 + 브로드캐스트 (공통 코어)
   */
  private async persistAndBroadcast(
    roomId: string,
    text: string,
    senderId: string,
    senderType: "consumer" | "store" | "system",
    options: InternalMessageOptions = {},
  ): Promise<MessageResponseDto> {
    // 메시지 검증
    const trimmedText = this.validateAndTrimMessage(text);

    // 마지막 메시지 미리보기 생성
    const lastMessagePreview = this.createLastMessagePreview(trimmedText);

    // 트랜잭션으로 메시지 생성과 채팅방 업데이트를 원자적으로 처리
    const message = await this.prisma.$transaction(
      async (tx) => {
        // 메시지 생성
        const createdMessage = await tx.message.create({
          data: {
            roomId,
            text: trimmedText,
            senderId,
            senderType: senderType.toUpperCase() as "CONSUMER" | "STORE" | "SYSTEM",
            isAiGenerated: options.isAiGenerated ?? false,
            aiSuggestsHandoff: options.aiSuggestsHandoff ?? false,
            productId: options.productId ?? null,
          },
        });

        // 채팅방 메타데이터 업데이트
        await this.updateChatRoomMetadata(tx, roomId, lastMessagePreview, senderType);

        return createdMessage;
      },
      {
        maxWait: 5000, // 최대 대기 시간 (5초)
        timeout: 10000, // 타임아웃 (10초)
      },
    );

    const messageDto = ChatMapperUtil.mapToMessageResponseDto(message);

    // WebSocket으로 메시지 브로드캐스트 (REST API로 전송된 메시지도 실시간으로 전달)
    this.chatGateway.broadcastMessage(roomId, messageDto);

    return messageDto;
  }

  /**
   * 메시지 검증 및 정리
   */
  private validateAndTrimMessage(text: string): string {
    const trimmedText = text.trim();

    if (trimmedText.length === 0) {
      LoggerUtil.log(`메시지 검증 실패: 메시지 내용이 비어있음`);
      throw new BadRequestException("메시지 내용이 비어있습니다.");
    }

    if (trimmedText.length > ChatMessageCreateService.MAX_MESSAGE_LENGTH) {
      LoggerUtil.log(
        `메시지 검증 실패: 메시지 길이 초과 - length: ${trimmedText.length}, maxLength: ${ChatMessageCreateService.MAX_MESSAGE_LENGTH}`,
      );
      throw new BadRequestException(
        `메시지는 ${ChatMessageCreateService.MAX_MESSAGE_LENGTH}자를 초과할 수 없습니다.`,
      );
    }

    return trimmedText;
  }

  /**
   * 마지막 메시지 미리보기 생성
   */
  private createLastMessagePreview(text: string): string {
    return text.length > ChatMessageCreateService.MAX_MESSAGE_LENGTH
      ? text.substring(0, ChatMessageCreateService.MAX_MESSAGE_LENGTH)
      : text;
  }

  /**
   * 채팅방 메타데이터 업데이트
   * SYSTEM 메시지(무응답 안내 등)는 구매자에게 보이는 안내이므로 userUnread를 증가시킵니다.
   */
  private async updateChatRoomMetadata(
    tx: Prisma.TransactionClient,
    roomId: string,
    lastMessagePreview: string,
    senderType: "consumer" | "store" | "system",
  ): Promise<void> {
    const updateData = {
      lastMessage: lastMessagePreview,
      lastMessageAt: new Date(),
      ...(senderType === "consumer"
        ? { storeUnread: { increment: 1 } }
        : { userUnread: { increment: 1 } }),
    };

    await tx.chatRoom.update({
      where: { id: roomId },
      data: updateData,
    });
  }
}
