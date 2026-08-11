import { Injectable } from "@nestjs/common";
import { CustomOrderRequestCreateService } from "./services/custom-order-request-create.service";
import { CustomOrderRequestQuoteService } from "./services/custom-order-request-quote.service";
import { CustomOrderRequestDecisionService } from "./services/custom-order-request-decision.service";
import { CreateCustomOrderRequestDto, QuoteCustomOrderRequestDto } from "./dto/custom-order.dto";

/**
 * 커스텀 주문 요청 서비스 (Facade)
 *
 * 요청 → 견적 → 승인/거절 → 주문 전환 흐름을 통합 제공합니다.
 */
@Injectable()
export class CustomOrderService {
  constructor(
    private readonly createService: CustomOrderRequestCreateService,
    private readonly quoteService: CustomOrderRequestQuoteService,
    private readonly decisionService: CustomOrderRequestDecisionService,
  ) {}

  /** 요청 생성 (구매자) */
  async createRequest(consumerId: string, dto: CreateCustomOrderRequestDto) {
    return await this.createService.create(consumerId, dto);
  }

  /** 견적 제시 (판매자) */
  async quote(requestId: string, sellerId: string, dto: QuoteCustomOrderRequestDto) {
    return await this.quoteService.quote(requestId, sellerId, dto);
  }

  /** 스토어의 요청 목록 (판매자) */
  async listForStore(storeId: string, sellerId: string, status?: string) {
    return await this.quoteService.listForStore(storeId, sellerId, status);
  }

  /** 요청 단건 조회 (채팅 카드 렌더링) */
  async getById(requestId: string, userId: string, userType: "consumer" | "store") {
    return await this.quoteService.getById(requestId, userId, userType);
  }

  /** 견적 승인 (구매자) */
  async accept(requestId: string, consumerId: string) {
    return await this.decisionService.accept(requestId, consumerId);
  }

  /** 견적 거절 (구매자) */
  async decline(requestId: string, consumerId: string) {
    return await this.decisionService.decline(requestId, consumerId);
  }
}
