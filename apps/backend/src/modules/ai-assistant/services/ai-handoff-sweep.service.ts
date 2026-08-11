import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import { LoggerUtil } from "@apps/backend/common/utils/logger.util";
import { ChatMessageCreateService } from "@apps/backend/modules/chat/services/chat-message-create.service";
import { isPickupAllowedForStore } from "@apps/backend/modules/order/utils/order-store-business-calendar.util";
import {
  AWAITING_SELLER_NUDGE_THRESHOLD_MS,
  AWAITING_SELLER_SWEEP_INTERVAL_MS,
  AI_SYSTEM_MESSAGES,
} from "../constants/ai-assistant.constants";

/**
 * 판매자 무응답 안내 스윕 (5분 주기 — order-automation.service.ts의 setInterval 패턴 재사용)
 *
 * 판매자 응답 대기 30분 경과 && 안내 미발송인 방에 SYSTEM 안내를 1회만 발송합니다.
 * 문구는 발송 시점의 영업시간 상태로 고른다 — 마감 직전에 이관되어 스윕 시점엔
 * 영업시간 외가 된 엣지에서도 안내가 누락되지 않도록.
 */
@Injectable()
export class AiHandoffSweepService implements OnModuleInit, OnModuleDestroy {
  private intervalRef: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly chatMessageCreateService: ChatMessageCreateService,
  ) {}

  onModuleInit() {
    void this.sweep();
    this.intervalRef = setInterval(() => void this.sweep(), AWAITING_SELLER_SWEEP_INTERVAL_MS);
  }

  onModuleDestroy() {
    if (this.intervalRef) clearInterval(this.intervalRef);
  }

  private async sweep(): Promise<void> {
    try {
      const threshold = new Date(Date.now() - AWAITING_SELLER_NUDGE_THRESHOLD_MS);
      const rooms = await this.prisma.chatRoom.findMany({
        where: {
          awaitingSellerSince: { not: null, lte: threshold },
          awaitingSellerNudgeSentAt: null,
        },
        include: { store: true },
        take: 100,
      });

      for (const room of rooms) {
        const isOpen = isPickupAllowedForStore(new Date(), room.store);
        const text = isOpen
          ? AI_SYSTEM_MESSAGES.SELLER_BUSY
          : AI_SYSTEM_MESSAGES.OUTSIDE_BUSINESS_HOURS;

        await this.chatMessageCreateService.sendSystemMessage(room.id, text);
        await this.prisma.chatRoom.update({
          where: { id: room.id },
          data: { awaitingSellerNudgeSentAt: new Date() },
        });
      }

      if (rooms.length > 0) {
        LoggerUtil.log(`[AiHandoffSweep] 무응답 안내 발송 ${rooms.length}건`);
      }
    } catch (error) {
      LoggerUtil.log(
        `[AiHandoffSweep] 스윕 실패: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
