import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { Auth } from "@apps/backend/modules/auth/decorators/auth.decorator";
import { SwaggerResponse } from "@apps/backend/common/decorators/swagger-response.decorator";
import { SwaggerAuthResponses } from "@apps/backend/common/decorators/swagger-auth-responses.decorator";
import { createMessageObject } from "@apps/backend/common/utils/message.util";
import { JwtVerifiedPayload } from "@apps/backend/modules/auth/types/auth.types";
import { AUDIENCE } from "@apps/backend/modules/auth/constants/auth.constants";
import { CustomOrderService } from "@apps/backend/modules/custom-order/custom-order.service";
import { CreateCustomOrderRequestDto } from "@apps/backend/modules/custom-order/dto/custom-order.dto";
import { CUSTOM_ORDER_ERROR_MESSAGES } from "@apps/backend/modules/custom-order/constants/custom-order.constants";

/**
 * 커스텀 주문 요청 컨트롤러 (구매자용)
 */
@ApiTags("커스텀 주문 요청")
@Controller(`${AUDIENCE.CONSUMER}/custom-order-requests`)
@Auth({ isPublic: false, audiences: ["consumer"] })
export class ConsumerCustomOrderRequestController {
  constructor(private readonly customOrderService: CustomOrderService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "(로그인 필요) 맞춤 주문 요청 생성",
    description:
      "상담 후 가격 결정 상품에 사진·요청사항·희망 픽업 일시를 담아 요청을 보냅니다. 요청 즉시 해당 채팅방의 AI 자동응답이 꺼지고 요청 카드가 표시됩니다.",
  })
  @SwaggerResponse(201, { dataExample: { id: "cm123", roomId: "cm456", status: "REQUESTED" } })
  @SwaggerAuthResponses()
  @SwaggerResponse(400, {
    dataExample: createMessageObject(CUSTOM_ORDER_ERROR_MESSAGES.PRODUCT_NOT_QUOTABLE),
  })
  @SwaggerResponse(404, {
    dataExample: createMessageObject(CUSTOM_ORDER_ERROR_MESSAGES.PRODUCT_NOT_FOUND),
  })
  async create(
    @Body() dto: CreateCustomOrderRequestDto,
    @Request() req: { user: JwtVerifiedPayload },
  ) {
    return await this.customOrderService.createRequest(req.user.sub, dto);
  }

  @Get(":requestId")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 맞춤 주문 요청 조회",
    description: "채팅 타임라인의 요청/견적 카드 렌더링에 사용합니다.",
  })
  @SwaggerAuthResponses()
  @SwaggerResponse(404, {
    dataExample: createMessageObject(CUSTOM_ORDER_ERROR_MESSAGES.REQUEST_NOT_FOUND),
  })
  async getById(
    @Param("requestId") requestId: string,
    @Request() req: { user: JwtVerifiedPayload },
  ) {
    return await this.customOrderService.getById(requestId, req.user.sub, "consumer");
  }

  @Post(":requestId/accept")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 견적 승인",
    description:
      "견적을 승인해 주문으로 전환합니다. 판매자가 이미 견적으로 예약을 승인했으므로 곧바로 입금대기 주문이 생성되고 입금 안내 알림톡이 발송됩니다.",
  })
  @SwaggerResponse(200, { dataExample: { orderId: "cm789", status: "ACCEPTED" } })
  @SwaggerAuthResponses()
  @SwaggerResponse(400, {
    dataExample: createMessageObject(CUSTOM_ORDER_ERROR_MESSAGES.PICKUP_DATE_PASSED),
  })
  async accept(
    @Param("requestId") requestId: string,
    @Request() req: { user: JwtVerifiedPayload },
  ) {
    return await this.customOrderService.accept(requestId, req.user.sub);
  }

  @Post(":requestId/decline")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 견적 거절",
    description: "견적을 거절합니다. 다시 시도하려면 채팅으로 조율 후 새 요청을 생성합니다.",
  })
  @SwaggerResponse(200, { dataExample: { id: "cm123", status: "DECLINED" } })
  @SwaggerAuthResponses()
  async decline(
    @Param("requestId") requestId: string,
    @Request() req: { user: JwtVerifiedPayload },
  ) {
    return await this.customOrderService.decline(requestId, req.user.sub);
  }
}
