import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  Request,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { Auth } from "@apps/backend/modules/auth/decorators/auth.decorator";
import { SwaggerResponse } from "@apps/backend/common/decorators/swagger-response.decorator";
import { SwaggerAuthResponses } from "@apps/backend/common/decorators/swagger-auth-responses.decorator";
import { createMessageObject } from "@apps/backend/common/utils/message.util";
import { JwtVerifiedPayload } from "@apps/backend/modules/auth/types/auth.types";
import { AUDIENCE } from "@apps/backend/modules/auth/constants/auth.constants";
import { CustomOrderService } from "@apps/backend/modules/custom-order/custom-order.service";
import { QuoteCustomOrderRequestDto } from "@apps/backend/modules/custom-order/dto/custom-order.dto";
import { CUSTOM_ORDER_ERROR_MESSAGES } from "@apps/backend/modules/custom-order/constants/custom-order.constants";

/**
 * 커스텀 주문 요청 컨트롤러 (판매자용)
 */
@ApiTags("커스텀 주문 요청")
@Controller(AUDIENCE.SELLER)
@Auth({ isPublic: false, audiences: ["seller"] })
export class SellerCustomOrderRequestController {
  constructor(private readonly customOrderService: CustomOrderService) {}

  @Get("store/:storeId/custom-order-requests")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 맞춤 주문 요청 목록",
    description: "스토어에 접수된 맞춤 주문 요청 목록을 최신순으로 조회합니다.",
  })
  @ApiQuery({ name: "status", required: false, description: "REQUESTED / QUOTED / ACCEPTED 등" })
  @SwaggerAuthResponses()
  async list(
    @Param("storeId") storeId: string,
    @Query("status") status: string | undefined,
    @Request() req: { user: JwtVerifiedPayload },
  ) {
    return await this.customOrderService.listForStore(storeId, req.user.sub, status);
  }

  @Get("custom-order-requests/:requestId")
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
    return await this.customOrderService.getById(requestId, req.user.sub, "store");
  }

  @Patch("custom-order-requests/:requestId/quote")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 견적 제시",
    description:
      "사진·요청사항을 확인한 뒤 견적가를 제시합니다. 견적은 1회만 제시할 수 있으며, 이후 손님이 승인/거절합니다.",
  })
  @SwaggerResponse(200, { dataExample: { id: "cm123", status: "QUOTED", quotedPrice: 65000 } })
  @SwaggerAuthResponses()
  @SwaggerResponse(400, {
    dataExample: createMessageObject(CUSTOM_ORDER_ERROR_MESSAGES.INVALID_STATUS_FOR_QUOTE),
  })
  async quote(
    @Param("requestId") requestId: string,
    @Body() dto: QuoteCustomOrderRequestDto,
    @Request() req: { user: JwtVerifiedPayload },
  ) {
    return await this.customOrderService.quote(requestId, req.user.sub, dto);
  }
}
