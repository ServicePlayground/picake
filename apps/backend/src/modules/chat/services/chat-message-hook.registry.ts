import { Injectable } from "@nestjs/common";
import { LoggerUtil } from "@apps/backend/common/utils/logger.util";

/** 사람이 보낸 메시지 도착 시 호출되는 훅 */
export interface ChatMessageHook {
  onConsumerMessage(roomId: string): Promise<void>;
  onSellerMessage(roomId: string, text: string): Promise<void>;
}

/**
 * 채팅 메시지 훅 레지스트리
 *
 * ChatModule이 AiAssistantModule을 직접 의존하지 않도록 중간에 두는 얇은 레이어입니다.
 * AI 모듈이 부팅 시 자신을 등록하고, 채팅 모듈은 훅이 있으면 호출만 합니다
 * (양방향 forwardRef가 DI 해석을 깨뜨리므로 단방향 의존으로 정리).
 */
@Injectable()
export class ChatMessageHookRegistry {
  private hook: ChatMessageHook | null = null;

  register(hook: ChatMessageHook): void {
    this.hook = hook;
  }

  /**
   * 사람이 보낸 메시지 통지 (fire-and-forget — 훅 실패가 메시지 전송에 영향을 주지 않음)
   */
  notifyHumanMessage(roomId: string, senderType: "consumer" | "store", text: string): void {
    if (!this.hook) return;

    const task =
      senderType === "consumer"
        ? this.hook.onConsumerMessage(roomId)
        : this.hook.onSellerMessage(roomId, text);

    void task.catch((error) => {
      LoggerUtil.log(
        `[ChatMessageHook] 훅 실행 실패 room=${roomId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    });
  }
}
