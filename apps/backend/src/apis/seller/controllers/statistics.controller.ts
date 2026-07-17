import { Controller, Get, HttpCode, HttpStatus, Query, Request } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiExtraModels } from "@nestjs/swagger";
import { Auth } from "@apps/backend/modules/auth/decorators/auth.decorator";
import { SwaggerResponse } from "@apps/backend/common/decorators/swagger-response.decorator";
import { SwaggerAuthResponses } from "@apps/backend/common/decorators/swagger-auth-responses.decorator";
import { JwtVerifiedPayload } from "@apps/backend/modules/auth/types/auth.types";
import { AUDIENCE } from "@apps/backend/modules/auth/constants/auth.constants";
import {
  SellerOrderStatisticsOverviewRequestDto,
  SellerOrderStatisticsOverviewResponseDto,
} from "@apps/backend/modules/statistics/seller/dto/seller-order-statistics-overview.dto";
import { SellerOrderStatisticsService } from "@apps/backend/modules/statistics/seller/services/seller-order-statistics.service";
import { createMessageObject } from "@apps/backend/common/utils/message.util";
import { ORDER_ERROR_MESSAGES } from "@apps/backend/modules/order/constants/order.constants";

/**
 * 판매자 통계 API
 *
 * 주문·상품 등 도메인별 통계 엔드포인트를 `/seller/statistics/...` 아래에 둡니다.
 */
@ApiTags("통계")
@ApiExtraModels(SellerOrderStatisticsOverviewResponseDto)
@Controller(`${AUDIENCE.SELLER}/statistics`)
@Auth({ isPublic: false, audiences: ["seller"] }) // 판매자 JWT(aud: seller)만 허용
export class SellerStatisticsController {
  constructor(private readonly orderStatisticsService: SellerOrderStatisticsService) {}

  /**
   * 스토어 주문 통계(기간별 요약·상품 랭킹·요일·시간대)
   * 픽업 완료(PICKUP_COMPLETED) 주문만 집계합니다.
   */
  @Get("orders/overview")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 스토어 주문 통계 개요",
    description:
      "storeId·startDate·endDate(YYYY-MM-DD, Asia/Seoul) 기준으로, 주문 접수 시각(created_at)이 해당 구간에 있으면서 상태가 픽업 완료(PICKUP_COMPLETED)인 주문만 집계합니다. 총 매출·건수, 상품 랭킹, 요일·시간대(접수 시각 기준), 요일·시간대(픽업 예정일시 pickup_date 기준, null 픽업일 제외)를 반환합니다.",
  })
  @SwaggerResponse(200, { dataDto: SellerOrderStatisticsOverviewResponseDto })
  @SwaggerAuthResponses()
  @SwaggerResponse(403, {
    dataExample: createMessageObject(ORDER_ERROR_MESSAGES.STORE_NOT_OWNED),
  })
  async getOrderOverview(
    @Query() query: SellerOrderStatisticsOverviewRequestDto,
    @Request() req: { user: JwtVerifiedPayload },
  ) {
    return await this.orderStatisticsService.getOverview(query, req.user);
  }
}
