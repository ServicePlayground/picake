import { Module } from "@nestjs/common";
import { DatabaseModule } from "@apps/backend/infra/database/database.module";
import { ChatModule } from "@apps/backend/modules/chat/chat.module";
import { OrderModule } from "@apps/backend/modules/order/order.module";
import { CustomOrderService } from "./custom-order.service";
import { CustomOrderRequestCreateService } from "./services/custom-order-request-create.service";
import { CustomOrderRequestQuoteService } from "./services/custom-order-request-quote.service";
import { CustomOrderRequestDecisionService } from "./services/custom-order-request-decision.service";

/**
 * 커스텀 주문 요청 모듈 (Phase 2)
 *
 * 상담 후 가격 결정 상품의 건별 견적 흐름(요청 → 견적 → 승인 → 주문 전환)을 담당합니다.
 * 채팅 인프라와 기존 주문 파이프라인을 재사용하며, 새 결제 흐름을 만들지 않습니다.
 */
@Module({
  imports: [DatabaseModule, ChatModule, OrderModule],
  providers: [
    CustomOrderService,
    CustomOrderRequestCreateService,
    CustomOrderRequestQuoteService,
    CustomOrderRequestDecisionService,
  ],
  exports: [CustomOrderService],
})
export class CustomOrderModule {}
