import { Injectable, OnModuleInit, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import { LoggerUtil } from "@apps/backend/common/utils/logger.util";
import { ChatMessageCreateService } from "@apps/backend/modules/chat/services/chat-message-create.service";
import {
  ChatMessageHook,
  ChatMessageHookRegistry,
} from "@apps/backend/modules/chat/services/chat-message-hook.registry";
import { ChatGateway } from "@apps/backend/modules/chat/gateways/chat.gateway";
import { ChatPermissionUtil } from "@apps/backend/modules/chat/utils/chat-permission.util";
import { isPickupAllowedForStore } from "@apps/backend/modules/order/utils/order-store-business-calendar.util";
import { AiContextBuildService } from "./services/ai-context-build.service";
import { AiResponseGenerateService } from "./services/ai-response-generate.service";
import { AiUnansweredQuestionCaptureService } from "./services/ai-unanswered-question-capture.service";
import {
  AI_DAILY_LIMIT_PER_CONSUMER,
  AI_DAILY_LIMIT_PER_STORE,
  AI_SYSTEM_MESSAGES,
  AI_ASSISTANT_ERROR_MESSAGES,
} from "./constants/ai-assistant.constants";

type StoreRowForGate = {
  id: string;
  weeklyClosedWeekdays: number[];
  standardOpenTime: string;
  standardCloseTime: string;
  businessCalendarOverrides: unknown;
};

/**
 * AI 자동응답 파사드 서비스
 *
 * 구매자 메시지 도착 시 게이트 판정(스토어 opt-in → 스케줄 → 방 토글) 후
 * AI 응답을 생성·발송하고, 사람 이관/무응답 대기 상태를 관리합니다.
 */
@Injectable()
export class AiAssistantService implements OnModuleInit, ChatMessageHook {
  /** 방 단위 in-flight 락 (서버 1대 전제 — 연속 메시지의 중복 LLM 트리거 방지) */
  private readonly inFlightRooms = new Set<string>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly contextBuildService: AiContextBuildService,
    private readonly responseGenerateService: AiResponseGenerateService,
    private readonly unansweredCaptureService: AiUnansweredQuestionCaptureService,
    private readonly chatMessageCreateService: ChatMessageCreateService,
    private readonly chatGateway: ChatGateway,
    private readonly hookRegistry: ChatMessageHookRegistry,
  ) {}

  /** 채팅 메시지 훅으로 자신을 등록 (ChatModule → AiAssistantModule 역방향 의존 제거) */
  onModuleInit() {
    this.hookRegistry.register(this);
  }

  /** ChatMessageHook 구현 — 구매자 메시지 */
  async onConsumerMessage(roomId: string): Promise<void> {
    await this.handleIncomingConsumerMessage(roomId);
  }

  /** ChatMessageHook 구현 — 판매자 메시지 */
  async onSellerMessage(roomId: string, text: string): Promise<void> {
    await this.handleSellerMessage(roomId, text);
  }

  /**
   * 구매자 메시지 도착 훅 (fire-and-forget — 실패해도 원 메시지 전송에 영향 없음)
   */
  async handleIncomingConsumerMessage(roomId: string): Promise<void> {
    try {
      const room = await this.prisma.chatRoom.findUnique({
        where: { id: roomId },
        include: { store: { include: { aiAssistantSetting: true } } },
      });
      if (!room) return;

      const aiActive = room.aiEnabled && this.isAiActiveForStore(room.store);

      if (!aiActive) {
        // 판매자 응답 대기 상태로 전환 (+ 영업시간 외라면 즉시 안내 1회)
        await this.markAwaitingSeller(roomId, room.store);
        return;
      }

      // 방 단위 in-flight 락 — 락 중 도착한 메시지는 응답 후 재확인 루프에서 합산 처리
      if (this.inFlightRooms.has(roomId)) return;
      this.inFlightRooms.add(roomId);
      try {
        await this.generateAndReplyLoop(roomId, room.storeId, room.store);
      } finally {
        this.inFlightRooms.delete(roomId);
      }
    } catch (error) {
      LoggerUtil.log(
        `[AiAssistant] 구매자 메시지 처리 실패 room=${roomId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 판매자 직접 답장 훅 — 사람 개입 확정 (fire-and-forget)
   */
  async handleSellerMessage(roomId: string, messageText: string): Promise<void> {
    try {
      await this.prisma.chatRoom.update({
        where: { id: roomId },
        data: { aiEnabled: false, awaitingSellerSince: null, awaitingSellerNudgeSentAt: null },
      });
      // 핸드오프된 방의 판매자 첫 답장을 FAQ 등록 초안으로 캡처
      await this.unansweredCaptureService.captureSellerAnswer(roomId, messageText);
    } catch (error) {
      LoggerUtil.log(
        `[AiAssistant] 판매자 메시지 처리 실패 room=${roomId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 사람 연결 요청 (quick-reply "네, 연결해주세요" 전용 API)
   */
  async requestHuman(roomId: string, consumerId: string): Promise<{ success: true }> {
    const room = await this.prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: { store: true },
    });
    if (!room) throw new NotFoundException(AI_ASSISTANT_ERROR_MESSAGES.SETTING_NOT_FOUND);
    await ChatPermissionUtil.verifyChatRoomAccess(room, consumerId, "consumer", this.prisma);

    await this.confirmHandoff(roomId, room.store);
    return { success: true };
  }

  /**
   * 방의 AI 상태 조회 (판매자 화면의 응대중 토글 초기값)
   */
  async getRoomAiState(roomId: string, sellerId: string): Promise<{ aiEnabled: boolean }> {
    const room = await this.prisma.chatRoom.findUnique({ where: { id: roomId } });
    if (!room) throw new NotFoundException(AI_ASSISTANT_ERROR_MESSAGES.SETTING_NOT_FOUND);
    await ChatPermissionUtil.verifyChatRoomAccess(room, sellerId, "store", this.prisma);
    return { aiEnabled: room.aiEnabled };
  }

  /**
   * 판매자 응대중 토글 — 이 방만 AI on/off (다른 방에는 영향 없음)
   */
  async toggleAi(roomId: string, sellerId: string, enabled: boolean): Promise<{ aiEnabled: boolean }> {
    const room = await this.prisma.chatRoom.findUnique({ where: { id: roomId } });
    if (!room) throw new NotFoundException(AI_ASSISTANT_ERROR_MESSAGES.SETTING_NOT_FOUND);
    await ChatPermissionUtil.verifyChatRoomAccess(room, sellerId, "store", this.prisma);

    const updated = await this.prisma.chatRoom.update({
      where: { id: roomId },
      data: {
        aiEnabled: enabled,
        // AI를 다시 켜면 대기 상태 해제 (AI가 응대를 재개하므로)
        ...(enabled ? { awaitingSellerSince: null, awaitingSellerNudgeSentAt: null } : {}),
      },
    });
    return { aiEnabled: updated.aiEnabled };
  }

  /**
   * AI 메시지 피드백 (👍/👎 — isAiGenerated=true 메시지만 허용)
   */
  async setMessageFeedback(
    roomId: string,
    messageId: string,
    consumerId: string,
    rating: "positive" | "negative",
  ): Promise<{ success: true }> {
    const room = await this.prisma.chatRoom.findUnique({ where: { id: roomId } });
    if (!room) throw new NotFoundException(AI_ASSISTANT_ERROR_MESSAGES.SETTING_NOT_FOUND);
    await ChatPermissionUtil.verifyChatRoomAccess(room, consumerId, "consumer", this.prisma);

    const message = await this.prisma.message.findUnique({ where: { id: messageId } });
    if (!message || message.roomId !== roomId) {
      throw new NotFoundException(AI_ASSISTANT_ERROR_MESSAGES.MESSAGE_NOT_FOUND);
    }
    if (!message.isAiGenerated) {
      throw new BadRequestException(AI_ASSISTANT_ERROR_MESSAGES.FEEDBACK_NOT_ALLOWED);
    }

    await this.prisma.message.update({
      where: { id: messageId },
      data: { aiFeedback: rating === "positive" ? "POSITIVE" : "NEGATIVE" },
    });
    return { success: true };
  }

  // ---------------------------------------------------------------
  // 내부 로직
  // ---------------------------------------------------------------

  /** 스토어 게이트: opt-in(설정 row 존재) + 스케줄 모드 판정 */
  private isAiActiveForStore(
    store: StoreRowForGate & { aiAssistantSetting: { scheduleMode: string } | null },
  ): boolean {
    const setting = store.aiAssistantSetting;
    if (!setting) return false; // opt-in — 설정 없으면 AI 동작 안 함
    switch (setting.scheduleMode) {
      case "ALWAYS":
        return true;
      case "OUTSIDE_BUSINESS_HOURS":
        return !this.isStoreOpenNow(store);
      default:
        return false; // OFF
    }
  }

  /** 지금 이 스토어가 영업 중인가 (기존 영업 캘린더 판정 재사용) */
  private isStoreOpenNow(store: StoreRowForGate): boolean {
    return isPickupAllowedForStore(new Date(), store);
  }

  /**
   * LLM 호출 → 응답 발송 루프
   * 락 중 도착한 신규 구매자 메시지가 있으면 1회 더 실행해 낡은 응답으로 끝나지 않게 한다.
   */
  private async generateAndReplyLoop(
    roomId: string,
    storeId: string,
    store: StoreRowForGate,
  ): Promise<void> {
    const MAX_RUNS = 2;
    for (let run = 0; run < MAX_RUNS; run++) {
      const latestConsumerMessage = await this.prisma.message.findFirst({
        where: { roomId, senderType: "CONSUMER" },
        orderBy: { createdAt: "desc" },
      });
      if (!latestConsumerMessage) return;

      // 일일 한도 확인 — 초과 시 LLM 호출 없이 "모르겠다" 폴백과 동일 경로
      const withinLimit = await this.checkDailyLimits(storeId, roomId);

      // LLM을 호출조차 못한 경우(키 미설정·한도 초과)는 "AI가 답 못한 질문"으로 기록하지 않는다.
      // 지침을 보완해야 할 질문이 아니라 운영 이슈이므로, FAQ 제안 목록을 오염시키면 안 된다.
      const canCallLlm = withinLimit && this.responseGenerateService.isConfigured;

      let result;
      if (!canCallLlm) {
        result = { answer: "", canAnswer: false, requestsHuman: false };
      } else {
        // 타이핑 인디케이터 — LLM 왕복 수 초 동안 손님이 빈 화면을 보지 않게
        this.chatGateway.broadcastAiTyping(roomId, true);
        try {
          const context = await this.contextBuildService.buildStoreContext(
            storeId,
            latestConsumerMessage.productId,
          );
          if (!context) return;
          const history = await this.contextBuildService.buildConversationHistory(roomId);
          result = await this.responseGenerateService.generateReply(context, history);
        } finally {
          this.chatGateway.broadcastAiTyping(roomId, false);
        }
      }

      if (result.requestsHuman) {
        // 손님이 텍스트로 사람 연결을 명확히 요청 — 즉시 이관
        await this.confirmHandoff(roomId, store);
        return;
      }

      if (result.canAnswer && result.answer) {
        await this.chatMessageCreateService.sendAiMessage(roomId, result.answer, storeId);
        // AI가 사장님 대신 응대를 마쳤으므로 대기 상태를 해제하고 판매자 미확인 카운트도 정리한다.
        // (AI가 처리한 대화까지 안 읽음으로 남으면 뱃지가 계속 쌓여, 정말 사장님이 봐야 하는
        //  이관된 대화와 구분되지 않는다 — 뱃지는 "확인이 필요한 대화"만 의미해야 함)
        await this.prisma.chatRoom.update({
          where: { id: roomId },
          data: { awaitingSellerSince: null, awaitingSellerNudgeSentAt: null, storeUnread: 0 },
        });
      } else {
        // 모르겠어요 + 연결 제안 (이관은 손님이 동의해야 확정)
        const fallbackText =
          result.answer ||
          "음, 이 부분은 제가 정확히 답변드리기 어려워요. 사장님과 연결해드릴까요?";
        await this.chatMessageCreateService.sendAiMessage(roomId, fallbackText, storeId, {
          aiSuggestsHandoff: true,
        });
        if (canCallLlm) {
          await this.unansweredCaptureService.capture(storeId, roomId, latestConsumerMessage.text);
        }
      }

      // 락 중 도착한 신규 구매자 메시지 확인 — 없으면 종료
      const newerMessage = await this.prisma.message.findFirst({
        where: {
          roomId,
          senderType: "CONSUMER",
          createdAt: { gt: latestConsumerMessage.createdAt },
        },
      });
      if (!newerMessage) return;
    }
  }

  /**
   * 이관 확정 — aiEnabled=false + 대기 시작 + 확인 메시지 + (영업시간 외면) 즉시 안내
   */
  private async confirmHandoff(roomId: string, store: StoreRowForGate): Promise<void> {
    // 이미 사람 응대로 넘어간 방이면 확인 메시지를 다시 보내지 않는다
    // (연결 버튼 중복 클릭·requestsHuman 중복 판정 시 안내가 여러 번 쌓이는 것 방지)
    const claimed = await this.prisma.chatRoom.updateMany({
      where: { id: roomId, aiEnabled: true },
      data: { aiEnabled: false, awaitingSellerSince: new Date() },
    });
    if (claimed.count === 0) return;

    // 이관 확인 메시지 — 손님이 다음 응답까지 침묵을 보지 않게
    await this.chatMessageCreateService.sendSystemMessage(
      roomId,
      AI_SYSTEM_MESSAGES.HANDOFF_CONFIRMED,
    );

    // 영업시간 외 이관은 스윕을 기다리지 않고 즉시 1회 안내
    if (!this.isStoreOpenNow(store)) {
      await this.chatMessageCreateService.sendSystemMessage(
        roomId,
        AI_SYSTEM_MESSAGES.OUTSIDE_BUSINESS_HOURS,
      );
      await this.prisma.chatRoom.update({
        where: { id: roomId },
        data: { awaitingSellerNudgeSentAt: new Date() },
      });
    }
  }

  /**
   * AI가 응답하지 않는 방(게이트에 막힘)의 구매자 메시지 → 판매자 응답 대기 상태로 전환
   */
  private async markAwaitingSeller(roomId: string, store: StoreRowForGate): Promise<void> {
    const room = await this.prisma.chatRoom.findUnique({ where: { id: roomId } });
    if (!room || room.awaitingSellerSince) return; // 이미 대기 중이면 유지

    await this.prisma.chatRoom.update({
      where: { id: roomId },
      data: { awaitingSellerSince: new Date() },
    });

    // 영업시간 외라면 즉시 1회 안내 (스윕은 영업시간 중 30분 무응답만 담당)
    if (!this.isStoreOpenNow(store) && !room.awaitingSellerNudgeSentAt) {
      await this.chatMessageCreateService.sendSystemMessage(
        roomId,
        AI_SYSTEM_MESSAGES.OUTSIDE_BUSINESS_HOURS,
      );
      await this.prisma.chatRoom.update({
        where: { id: roomId },
        data: { awaitingSellerNudgeSentAt: new Date() },
      });
    }
  }

  /** 일일 AI 호출 한도 확인 (스토어별 + 구매자별) */
  private async checkDailyLimits(storeId: string, roomId: string): Promise<boolean> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [storeCount, room] = await Promise.all([
      this.prisma.message.count({
        where: { isAiGenerated: true, createdAt: { gte: todayStart }, room: { storeId } },
      }),
      this.prisma.chatRoom.findUnique({ where: { id: roomId }, select: { consumerId: true } }),
    ]);
    if (storeCount >= AI_DAILY_LIMIT_PER_STORE) {
      LoggerUtil.log(`[AiAssistant] 스토어 일일 한도 초과 store=${storeId}`);
      return false;
    }

    if (room) {
      const consumerCount = await this.prisma.message.count({
        where: {
          isAiGenerated: true,
          createdAt: { gte: todayStart },
          room: { consumerId: room.consumerId },
        },
      });
      if (consumerCount >= AI_DAILY_LIMIT_PER_CONSUMER) {
        LoggerUtil.log(`[AiAssistant] 구매자 일일 한도 초과 consumer=${room.consumerId}`);
        return false;
      }
    }
    return true;
  }
}
