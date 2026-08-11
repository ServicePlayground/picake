import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import { ChatMessageCreateService } from "@apps/backend/modules/chat/services/chat-message-create.service";
import { QuoteCustomOrderRequestDto } from "../dto/custom-order.dto";
import {
  CUSTOM_ORDER_ERROR_MESSAGES,
  CUSTOM_ORDER_MESSAGES,
} from "../constants/custom-order.constants";

/**
 * 견적 제시 서비스 (판매자)
 * v1은 견적 1회 제시 후 승인/거절만 지원하므로 REQUESTED 상태에서만 허용합니다.
 */
@Injectable()
export class CustomOrderRequestQuoteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly chatMessageCreateService: ChatMessageCreateService,
  ) {}

  async quote(requestId: string, sellerId: string, dto: QuoteCustomOrderRequestDto) {
    const request = await this.prisma.customOrderRequest.findUnique({
      where: { id: requestId },
      include: { store: true },
    });
    if (!request) throw new NotFoundException(CUSTOM_ORDER_ERROR_MESSAGES.REQUEST_NOT_FOUND);
    if (request.store.sellerId !== sellerId) {
      throw new ForbiddenException(CUSTOM_ORDER_ERROR_MESSAGES.REQUEST_NOT_OWNED);
    }

    // 상태 전이를 조건부 원자 업데이트로 처리 (중복 견적 방지)
    const result = await this.prisma.customOrderRequest.updateMany({
      where: { id: requestId, status: "REQUESTED" },
      data: {
        status: "QUOTED",
        quotedPrice: dto.quotedPrice,
        sellerNote: dto.sellerNote ?? null,
      },
    });
    if (result.count === 0) {
      throw new BadRequestException(CUSTOM_ORDER_ERROR_MESSAGES.INVALID_STATUS_FOR_QUOTE);
    }

    await this.chatMessageCreateService.sendSystemMessage(
      request.roomId,
      CUSTOM_ORDER_MESSAGES.QUOTE_SENT,
      { relatedCustomOrderRequestId: request.id },
    );

    return { id: request.id, status: "QUOTED" as const, quotedPrice: dto.quotedPrice };
  }

  /** 판매자용 요청 목록 */
  async listForStore(storeId: string, sellerId: string, status?: string) {
    const store = await this.prisma.store.findUnique({ where: { id: storeId } });
    if (!store) throw new NotFoundException(CUSTOM_ORDER_ERROR_MESSAGES.REQUEST_NOT_FOUND);
    if (store.sellerId !== sellerId) {
      throw new ForbiddenException(CUSTOM_ORDER_ERROR_MESSAGES.REQUEST_NOT_OWNED);
    }

    return await this.prisma.customOrderRequest.findMany({
      where: {
        storeId,
        ...(status ? { status: status as never } : {}),
      },
      include: {
        product: { select: { id: true, name: true, images: true } },
        consumer: { select: { id: true, nickname: true, profileImageUrl: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  }

  /** 단건 조회 (채팅 카드 렌더링용 — 구매자/판매자 공통) */
  async getById(requestId: string, userId: string, userType: "consumer" | "store") {
    const request = await this.prisma.customOrderRequest.findUnique({
      where: { id: requestId },
      include: {
        product: { select: { id: true, name: true, images: true } },
        store: { select: { id: true, name: true, sellerId: true } },
      },
    });
    if (!request) throw new NotFoundException(CUSTOM_ORDER_ERROR_MESSAGES.REQUEST_NOT_FOUND);

    const authorized =
      userType === "consumer" ? request.consumerId === userId : request.store.sellerId === userId;
    if (!authorized) throw new ForbiddenException(CUSTOM_ORDER_ERROR_MESSAGES.REQUEST_NOT_OWNED);

    return request;
  }
}
