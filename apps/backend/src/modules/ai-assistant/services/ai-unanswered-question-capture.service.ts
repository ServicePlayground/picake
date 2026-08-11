import { Injectable } from "@nestjs/common";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";

/**
 * AI가 답하지 못한 질문 수집 서비스 (FAQ 자동 제안의 원재료)
 */
@Injectable()
export class AiUnansweredQuestionCaptureService {
  constructor(private readonly prisma: PrismaService) {}

  /** AI가 canAnswer=false로 답한 구매자 질문 원문 기록 */
  async capture(storeId: string, roomId: string, questionText: string): Promise<void> {
    await this.prisma.storeAiUnansweredQuestion.create({
      data: { storeId, roomId, questionText },
    });
  }

  /**
   * 핸드오프된 방에서 판매자가 실제로 보낸 첫 답장을 FAQ 등록 초안으로 캡처
   * (해당 방의 가장 최근 PENDING 질문 중 아직 초안이 없는 것에 연결)
   */
  async captureSellerAnswer(roomId: string, answerText: string): Promise<void> {
    const latestPending = await this.prisma.storeAiUnansweredQuestion.findFirst({
      where: { roomId, status: "PENDING", sellerAnswerDraft: null },
      orderBy: { createdAt: "desc" },
    });
    if (!latestPending) return;

    await this.prisma.storeAiUnansweredQuestion.update({
      where: { id: latestPending.id },
      data: { sellerAnswerDraft: answerText },
    });
  }
}
