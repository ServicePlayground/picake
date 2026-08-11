import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import { LoggerUtil } from "@apps/backend/common/utils/logger.util";
import { ChatMessageCreateService } from "@apps/backend/modules/chat/services/chat-message-create.service";
import { isPickupAllowedForStore } from "@apps/backend/modules/order/utils/order-store-business-calendar.util";
import { EnableStatus } from "@apps/backend/modules/product/constants/product.constants";
import { CreateCustomOrderRequestDto } from "../dto/custom-order.dto";
import {
  CUSTOM_ORDER_ERROR_MESSAGES,
  CUSTOM_ORDER_MESSAGES,
} from "../constants/custom-order.constants";

/**
 * 커스텀 주문 요청 생성 서비스
 *
 * 요청 생성 · AI 자동응답 중지 · 채팅 카드 메시지를 한 트랜잭션으로 처리합니다
 * (요청 제출과 일반 문의가 겹치는 레이스에서 AI가 끼어드는 것을 막기 위함).
 */
@Injectable()
export class CustomOrderRequestCreateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly chatMessageCreateService: ChatMessageCreateService,
  ) {}

  async create(consumerId: string, dto: CreateCustomOrderRequestDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
      include: { store: true },
    });
    if (!product) throw new NotFoundException(CUSTOM_ORDER_ERROR_MESSAGES.PRODUCT_NOT_FOUND);

    // 상담 후 가격 결정 상품만 견적 플로우를 탄다
    if (product.productType !== "CUSTOM_CAKE" || !product.requiresQuote) {
      throw new BadRequestException(CUSTOM_ORDER_ERROR_MESSAGES.PRODUCT_NOT_QUOTABLE);
    }
    if (
      product.salesStatus !== EnableStatus.ENABLE ||
      product.visibilityStatus !== EnableStatus.ENABLE
    ) {
      throw new BadRequestException(CUSTOM_ORDER_ERROR_MESSAGES.PRODUCT_INACTIVE);
    }

    // 희망 픽업 일시가 매장 영업시간 내인지 검증 (승인 시점에 재검증)
    const desiredDate = new Date(dto.desiredDate);
    if (!isPickupAllowedForStore(desiredDate, product.store)) {
      throw new BadRequestException(CUSTOM_ORDER_ERROR_MESSAGES.PICKUP_OUTSIDE_BUSINESS_HOURS);
    }

    // 채팅방 create-or-get (스토어당 1:1)
    const room = await this.prisma.chatRoom.upsert({
      where: { consumerId_storeId: { consumerId, storeId: product.storeId } },
      create: { consumerId, storeId: product.storeId },
      update: {},
    });

    // 요청 생성 + AI 중지를 원자적으로 처리
    const request = await this.prisma.$transaction(async (tx) => {
      const created = await tx.customOrderRequest.create({
        data: {
          productId: product.id,
          consumerId,
          storeId: product.storeId,
          roomId: room.id,
          images: dto.images ?? [],
          requirementsText: dto.requirementsText,
          quantity: dto.quantity ?? 1,
          desiredBudgetMin: dto.desiredBudgetMin ?? null,
          desiredBudgetMax: dto.desiredBudgetMax ?? null,
          desiredDate,
          reservationContactName: dto.reservationContactName ?? null,
          reservationPhone: dto.reservationPhone ?? null,
        },
      });

      // 가격이 걸린 문제라 AI는 관여하지 않는다
      await tx.chatRoom.update({
        where: { id: room.id },
        data: { aiEnabled: false },
      });

      return created;
    });

    // 채팅 타임라인에 요청 카드 표시
    // (견적은 문의 이관과 시간 기대가 달라 awaitingSellerSince는 세팅하지 않는다 — 무응답 안내 대상 아님)
    await this.chatMessageCreateService.sendSystemMessage(
      room.id,
      CUSTOM_ORDER_MESSAGES.REQUEST_CREATED,
      { relatedCustomOrderRequestId: request.id },
    );

    LoggerUtil.log(
      `커스텀 주문 요청 생성 - requestId: ${request.id}, productId: ${product.id}, consumerId: ${consumerId}`,
    );

    return { id: request.id, roomId: room.id, status: request.status };
  }
}
