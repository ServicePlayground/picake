import { Injectable } from "@nestjs/common";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import {
  businessCalendarStateFromStoreRow,
  getEffectiveSeoulDayOpenMinuteRange,
  getSeoulWallClockForPickup,
} from "@apps/backend/modules/store/utils/store-business-calendar.util";
import { AI_CONTEXT_RECENT_MESSAGE_COUNT } from "@apps/backend/modules/ai-assistant/constants/ai-assistant.constants";

/** LLM 프롬프트에 넣을 스토어 컨텍스트 (지침 + 자동 그라운딩 데이터) */
export interface AiStoreContext {
  storeName: string;
  storeDescription: string | null;
  instructions: string | null;
  faqs: { question: string; answer: string }[];
  businessHoursText: string;
  refundPolicyText: string;
  productContext: string | null;
}

/**
 * AI 응답 생성에 필요한 컨텍스트 조립 서비스
 *
 * 판매자 지침 + FAQ에 더해, 사장님이 따로 적지 않아도 스토어의 실제 데이터
 * (영업시간·환불정책·소개)를 자동으로 그라운딩합니다.
 */
@Injectable()
export class AiContextBuildService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 스토어 컨텍스트 조립
   * @param productId - 상품 상세에서 시작된 문의라면 해당 상품의 실시간 데이터 포함
   */
  async buildStoreContext(storeId: string, productId?: string | null): Promise<AiStoreContext | null> {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      include: {
        aiAssistantSetting: true,
        aiFaqs: { orderBy: { sortOrder: "asc" } },
      },
    });
    if (!store) return null;

    let productContext: string | null = null;
    if (productId) {
      const product = await this.prisma.product.findUnique({ where: { id: productId } });
      if (product) {
        const saleAvailable =
          product.salesStatus === "ENABLE" && product.visibilityStatus === "ENABLE";
        const lines = [
          `상품명: ${product.name}`,
          `판매가: ${product.salePrice.toLocaleString()}원`,
          `판매 가능 여부: ${saleAvailable ? "판매 중" : "현재 판매하지 않음"}`,
        ];
        if (product.requiresQuote) {
          lines.push("판매 방식: 상담 후 가격 결정 (맞춤 주문 요청으로 견적 진행)");
        }
        if (product.cakeSizeOptions) {
          lines.push(`사이즈 옵션: ${JSON.stringify(product.cakeSizeOptions)}`);
        }
        if (product.cakeFlavorOptions) {
          lines.push(`맛 옵션: ${JSON.stringify(product.cakeFlavorOptions)}`);
        }
        productContext = lines.join("\n");
      }
    }

    return {
      storeName: store.name,
      storeDescription: store.description,
      instructions: store.aiAssistantSetting?.instructions ?? null,
      faqs: store.aiFaqs.map((f) => ({ question: f.question, answer: f.answer })),
      businessHoursText: this.formatBusinessHours(store),
      refundPolicyText: this.formatRefundPolicy(store.refundCancellationPolicy),
      productContext,
    };
  }

  /**
   * 최근 대화 히스토리 조회 (CONSUMER/STORE 텍스트만 — SYSTEM 안내·견적 카드는 프롬프트 노이즈라 제외)
   */
  async buildConversationHistory(
    roomId: string,
  ): Promise<{ role: "user" | "assistant"; content: string }[]> {
    const messages = await this.prisma.message.findMany({
      where: {
        roomId,
        senderType: { in: ["CONSUMER", "STORE"] },
        relatedCustomOrderRequestId: null,
      },
      orderBy: { createdAt: "desc" },
      take: AI_CONTEXT_RECENT_MESSAGE_COUNT,
    });

    return messages
      .reverse()
      .map((m) => ({
        role: m.senderType === "CONSUMER" ? ("user" as const) : ("assistant" as const),
        content: m.text,
      }));
  }

  /** 영업 캘린더를 사람이 읽는 텍스트로 변환 (오늘 기준 영업시간 포함) */
  private formatBusinessHours(store: {
    weeklyClosedWeekdays: number[];
    standardOpenTime: string;
    standardCloseTime: string;
    businessCalendarOverrides: unknown;
  }): string {
    const state = businessCalendarStateFromStoreRow(store);
    const weekdayNames = ["일", "월", "화", "수", "목", "금", "토"];
    const closedDays = state.weeklyClosedWeekdays.map((d) => weekdayNames[d]).join(", ");

    const lines: string[] = [];
    if (state.standardOpenTime === "00:00" && state.standardCloseTime === "00:00") {
      lines.push("표준 영업시간: 하루 종일");
    } else {
      lines.push(`표준 영업시간: ${state.standardOpenTime} ~ ${state.standardCloseTime}`);
    }
    lines.push(closedDays ? `정기 휴무: 매주 ${closedDays}요일` : "정기 휴무 없음");

    // 오늘의 실제 영업 여부 (날짜별 예외 반영)
    const { dateKey } = getSeoulWallClockForPickup(new Date());
    const [year, month, day] = dateKey.split("-").map((v) => Number.parseInt(v, 10));
    const todayRange = getEffectiveSeoulDayOpenMinuteRange(state, year, month, day);
    if (!todayRange) {
      lines.push(`오늘(${dateKey})은 휴무입니다.`);
    }
    return lines.join("\n");
  }

  /** 환불·취소 규정 JSON을 텍스트로 변환 */
  private formatRefundPolicy(policy: unknown): string {
    try {
      const parsed = policy as { rules?: { daysBeforePickup: number; refundDescription: string }[] };
      const rules = parsed?.rules ?? [];
      if (rules.length === 0) return "등록된 환불 규정 없음";
      return rules
        .map((r) =>
          r.daysBeforePickup === 0
            ? `픽업 당일: ${r.refundDescription || "(설명 없음)"}`
            : `픽업 ${r.daysBeforePickup}일 전: ${r.refundDescription || "(설명 없음)"}`,
        )
        .join("\n");
    } catch {
      return "등록된 환불 규정 없음";
    }
  }
}
