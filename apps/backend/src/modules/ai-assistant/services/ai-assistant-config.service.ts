import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import { AI_ASSISTANT_ERROR_MESSAGES } from "../constants/ai-assistant.constants";
import { AiContextBuildService } from "./ai-context-build.service";
import { AiResponseGenerateService, AiReplyResult } from "./ai-response-generate.service";

/**
 * AI 자동응답 설정/FAQ/미답변질문/통계 서비스 (판매자용)
 */
@Injectable()
export class AiAssistantConfigService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly contextBuildService: AiContextBuildService,
    private readonly responseGenerateService: AiResponseGenerateService,
  ) {}

  /** 판매자의 스토어 소유권 검증 */
  private async verifyStoreOwnership(storeId: string, sellerId: string) {
    const store = await this.prisma.store.findUnique({ where: { id: storeId } });
    if (!store) throw new NotFoundException(AI_ASSISTANT_ERROR_MESSAGES.STORE_NOT_FOUND);
    if (store.sellerId !== sellerId) {
      throw new ForbiddenException(AI_ASSISTANT_ERROR_MESSAGES.STORE_NOT_OWNED);
    }
    return store;
  }

  // ---------------------------------------------------------------
  // 설정
  // ---------------------------------------------------------------

  async getSettings(storeId: string, sellerId: string) {
    const store = await this.verifyStoreOwnership(storeId, sellerId);
    const setting = await this.prisma.storeAiAssistantSetting.findUnique({ where: { storeId } });

    // 매장 정보 연동 상태 — 온보딩 1단계에서 초안 버튼 활성화 여부 판단용
    const hasBusinessHours =
      store.standardOpenTime !== "00:00" ||
      store.standardCloseTime !== "00:00" ||
      store.weeklyClosedWeekdays.length > 0;
    return {
      configured: Boolean(setting),
      scheduleMode: setting?.scheduleMode ?? "OFF",
      instructions: setting?.instructions ?? null,
      updatedAt: setting?.updatedAt ?? null,
      storeInfoStatus: {
        hasDescription: Boolean(store.description),
        hasBusinessHours,
        hasRefundPolicy: this.hasRefundPolicy(store.refundCancellationPolicy),
      },
    };
  }

  /**
   * 설정 저장 (upsert)
   * row 생성 시 scheduleMode 기본값은 OFF — 온보딩 3단계(시간대 설정)를 저장해야 AI가 켜진다.
   */
  async updateSettings(
    storeId: string,
    sellerId: string,
    input: { instructions?: string; scheduleMode?: "ALWAYS" | "OUTSIDE_BUSINESS_HOURS" | "OFF" },
  ) {
    await this.verifyStoreOwnership(storeId, sellerId);
    const setting = await this.prisma.storeAiAssistantSetting.upsert({
      where: { storeId },
      create: {
        storeId,
        instructions: input.instructions ?? null,
        scheduleMode: input.scheduleMode ?? "OFF",
      },
      update: {
        ...(input.instructions !== undefined ? { instructions: input.instructions } : {}),
        ...(input.scheduleMode !== undefined ? { scheduleMode: input.scheduleMode } : {}),
      },
    });
    return {
      configured: true,
      scheduleMode: setting.scheduleMode,
      instructions: setting.instructions,
      updatedAt: setting.updatedAt,
    };
  }

  // ---------------------------------------------------------------
  // FAQ CRUD
  // ---------------------------------------------------------------

  async getFaqs(storeId: string, sellerId: string) {
    await this.verifyStoreOwnership(storeId, sellerId);
    return await this.prisma.storeAiFaq.findMany({
      where: { storeId },
      orderBy: { sortOrder: "asc" },
    });
  }

  async createFaq(
    storeId: string,
    sellerId: string,
    input: { question: string; answer: string },
  ) {
    await this.verifyStoreOwnership(storeId, sellerId);
    const maxSort = await this.prisma.storeAiFaq.aggregate({
      where: { storeId },
      _max: { sortOrder: true },
    });
    return await this.prisma.storeAiFaq.create({
      data: {
        storeId,
        question: input.question,
        answer: input.answer,
        sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
      },
    });
  }

  async updateFaq(
    storeId: string,
    sellerId: string,
    faqId: string,
    input: { question?: string; answer?: string },
  ) {
    await this.verifyStoreOwnership(storeId, sellerId);
    const faq = await this.prisma.storeAiFaq.findUnique({ where: { id: faqId } });
    if (!faq || faq.storeId !== storeId) {
      throw new NotFoundException(AI_ASSISTANT_ERROR_MESSAGES.FAQ_NOT_FOUND);
    }
    return await this.prisma.storeAiFaq.update({
      where: { id: faqId },
      data: input,
    });
  }

  async deleteFaq(storeId: string, sellerId: string, faqId: string) {
    await this.verifyStoreOwnership(storeId, sellerId);
    const faq = await this.prisma.storeAiFaq.findUnique({ where: { id: faqId } });
    if (!faq || faq.storeId !== storeId) {
      throw new NotFoundException(AI_ASSISTANT_ERROR_MESSAGES.FAQ_NOT_FOUND);
    }
    await this.prisma.storeAiFaq.delete({ where: { id: faqId } });
    return { success: true };
  }

  // ---------------------------------------------------------------
  // 미답변 질문 (FAQ 자동 제안)
  // ---------------------------------------------------------------

  async getUnansweredQuestions(storeId: string, sellerId: string) {
    await this.verifyStoreOwnership(storeId, sellerId);
    return await this.prisma.storeAiUnansweredQuestion.findMany({
      where: { storeId, status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  /** 미답변 질문을 FAQ로 등록 (판매자 답변 초안이 있으면 그대로, 없으면 입력값 사용) */
  async convertToFaq(
    storeId: string,
    sellerId: string,
    questionId: string,
    answerOverride?: string,
  ) {
    await this.verifyStoreOwnership(storeId, sellerId);
    const question = await this.prisma.storeAiUnansweredQuestion.findUnique({
      where: { id: questionId },
    });
    if (!question || question.storeId !== storeId) {
      throw new NotFoundException(AI_ASSISTANT_ERROR_MESSAGES.UNANSWERED_QUESTION_NOT_FOUND);
    }
    const answer = answerOverride ?? question.sellerAnswerDraft ?? "";

    const [faq] = await this.prisma.$transaction([
      this.prisma.storeAiFaq.create({
        data: { storeId, question: question.questionText, answer, sortOrder: 9999 },
      }),
      this.prisma.storeAiUnansweredQuestion.update({
        where: { id: questionId },
        data: { status: "CONVERTED_TO_FAQ" },
      }),
    ]);
    return faq;
  }

  async dismissUnansweredQuestion(storeId: string, sellerId: string, questionId: string) {
    await this.verifyStoreOwnership(storeId, sellerId);
    const question = await this.prisma.storeAiUnansweredQuestion.findUnique({
      where: { id: questionId },
    });
    if (!question || question.storeId !== storeId) {
      throw new NotFoundException(AI_ASSISTANT_ERROR_MESSAGES.UNANSWERED_QUESTION_NOT_FOUND);
    }
    await this.prisma.storeAiUnansweredQuestion.update({
      where: { id: questionId },
      data: { status: "DISMISSED" },
    });
    return { success: true };
  }

  // ---------------------------------------------------------------
  // 미리테스트 / 초안 생성 (부작용 없음 — 기록·통계 미반영)
  // ---------------------------------------------------------------

  /** 저장 전 미리테스트 — 실제 채팅방/메시지를 만들지 않고 응답만 시뮬레이션 */
  async testReply(
    storeId: string,
    sellerId: string,
    input: { question: string; instructions?: string },
  ): Promise<AiReplyResult> {
    await this.verifyStoreOwnership(storeId, sellerId);
    const context = await this.contextBuildService.buildStoreContext(storeId);
    if (!context) throw new NotFoundException(AI_ASSISTANT_ERROR_MESSAGES.STORE_NOT_FOUND);

    // 저장 전 초안을 테스트할 수 있도록 지침 오버라이드 허용
    if (input.instructions !== undefined) context.instructions = input.instructions;

    return await this.responseGenerateService.generateReply(context, [
      { role: "user", content: input.question },
    ]);
  }

  /** 매장 정보로 지침 초안 생성 — 저장하지 않고 텍스트만 반환 */
  async generateInstructionsDraft(storeId: string, sellerId: string): Promise<{ draft: string | null }> {
    await this.verifyStoreOwnership(storeId, sellerId);
    const context = await this.contextBuildService.buildStoreContext(storeId);
    if (!context) throw new NotFoundException(AI_ASSISTANT_ERROR_MESSAGES.STORE_NOT_FOUND);
    const draft = await this.responseGenerateService.generateInstructionsDraft(context);
    return { draft };
  }

  // ---------------------------------------------------------------
  // 통계 (AI 처리 현황 대시보드)
  // ---------------------------------------------------------------

  /**
   * 응답시간은 상태 필드가 아니라 메시지 페어 분석으로 계산한다
   * (awaitingSellerSince는 판매자 응답 시 리셋되어 과거 데이터가 사라지므로).
   */
  async getStats(storeId: string, sellerId: string, rangeDays: number) {
    await this.verifyStoreOwnership(storeId, sellerId);
    const since = new Date(Date.now() - rangeDays * 24 * 60 * 60 * 1000);

    const [aiMessageCount, positiveCount, negativeCount, handoffSuggestCount, unansweredCount] =
      await Promise.all([
        this.prisma.message.count({
          where: { isAiGenerated: true, createdAt: { gte: since }, room: { storeId } },
        }),
        this.prisma.message.count({
          where: {
            isAiGenerated: true,
            aiFeedback: "POSITIVE",
            createdAt: { gte: since },
            room: { storeId },
          },
        }),
        this.prisma.message.count({
          where: {
            isAiGenerated: true,
            aiFeedback: "NEGATIVE",
            createdAt: { gte: since },
            room: { storeId },
          },
        }),
        this.prisma.message.count({
          where: {
            aiSuggestsHandoff: true,
            createdAt: { gte: since },
            room: { storeId },
          },
        }),
        this.prisma.storeAiUnansweredQuestion.count({
          where: { storeId, createdAt: { gte: since } },
        }),
      ]);

    // 메시지 페어 분석: 구매자 메시지 → 다음 STORE 메시지의 응답시간 (AI vs 사람)
    const messages = await this.prisma.message.findMany({
      where: {
        room: { storeId },
        createdAt: { gte: since },
        senderType: { in: ["CONSUMER", "STORE"] },
      },
      orderBy: [{ roomId: "asc" }, { createdAt: "asc" }],
      select: { roomId: true, senderType: true, isAiGenerated: true, createdAt: true },
    });

    let aiResponseTotalMs = 0;
    let aiResponsePairs = 0;
    let humanResponseTotalMs = 0;
    let humanResponsePairs = 0;
    let pendingConsumerAt: { roomId: string; at: Date } | null = null;

    for (const m of messages) {
      if (m.senderType === "CONSUMER") {
        if (!pendingConsumerAt || pendingConsumerAt.roomId !== m.roomId) {
          pendingConsumerAt = { roomId: m.roomId, at: m.createdAt };
        }
      } else if (pendingConsumerAt && pendingConsumerAt.roomId === m.roomId) {
        const diff = m.createdAt.getTime() - pendingConsumerAt.at.getTime();
        if (m.isAiGenerated) {
          aiResponseTotalMs += diff;
          aiResponsePairs += 1;
        } else {
          humanResponseTotalMs += diff;
          humanResponsePairs += 1;
        }
        pendingConsumerAt = null;
      }
    }

    // 일별 AI 처리량 (바 차트용)
    const dailyCounts: { date: string; count: number }[] = [];
    for (let i = rangeDays - 1; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setHours(0, 0, 0, 0);
      dayStart.setDate(dayStart.getDate() - i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      const count = await this.prisma.message.count({
        where: {
          isAiGenerated: true,
          createdAt: { gte: dayStart, lt: dayEnd },
          room: { storeId },
        },
      });
      dailyCounts.push({ date: dayStart.toISOString().slice(0, 10), count });
    }

    return {
      aiMessageCount,
      // 사람 이관 건수 = AI가 못 답해 연결 제안한 건 + 미답변 질문 (이관 이벤트 로그 없이 의미와 일치하는 집계)
      handoffCount: handoffSuggestCount,
      unansweredCount,
      feedback: { positive: positiveCount, negative: negativeCount },
      avgResponseMs: {
        ai: aiResponsePairs > 0 ? Math.round(aiResponseTotalMs / aiResponsePairs) : null,
        human: humanResponsePairs > 0 ? Math.round(humanResponseTotalMs / humanResponsePairs) : null,
      },
      dailyCounts,
    };
  }

  private hasRefundPolicy(policy: unknown): boolean {
    try {
      const parsed = policy as { rules?: { refundDescription?: string }[] };
      return Boolean(parsed?.rules?.some((r) => r.refundDescription));
    } catch {
      return false;
    }
  }
}
