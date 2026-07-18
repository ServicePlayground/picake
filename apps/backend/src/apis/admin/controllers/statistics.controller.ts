import { Controller, Get, HttpCode, HttpStatus, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiExtraModels } from "@nestjs/swagger";
import { Auth } from "@apps/backend/modules/auth/decorators/auth.decorator";
import { SwaggerResponse } from "@apps/backend/common/decorators/swagger-response.decorator";
import { SwaggerAuthResponses } from "@apps/backend/common/decorators/swagger-auth-responses.decorator";
import { AUDIENCE } from "@apps/backend/modules/auth/constants/auth.constants";
import { ADMIN_STATISTICS_ERROR_MESSAGES } from "@apps/backend/modules/statistics/admin/constants/admin-statistics.constants";
import {
  AdminStatisticsDailyTrendsRequestDto,
  AdminStatisticsDailyTrendsResponseDto,
} from "@apps/backend/modules/statistics/admin/dto/admin-statistics-daily-trends.dto";
import {
  AdminStatisticsOrdersResponseDto,
  AdminStatisticsStoreEntryRequestsResponseDto,
  AdminStatisticsStoresResponseDto,
  AdminStatisticsUsersResponseDto,
} from "@apps/backend/modules/statistics/admin/dto/admin-statistics-summary.dto";
import { AdminStatisticsService } from "@apps/backend/modules/statistics/admin/services/admin-statistics.service";
import { createMessageObject } from "@apps/backend/common/utils/message.util";

/**
 * 관리자 통계 컨트롤러
 *
 * 도메인별 집계 엔드포인트를 `/admin/statistics/...` 아래에 둡니다.
 * DB가 원본인 지표만 다루며, 행동 데이터(페이지뷰·퍼널 등)는 PostHog에서 봅니다.
 */
@ApiTags("[관리자] 통계")
@ApiExtraModels(
  AdminStatisticsUsersResponseDto,
  AdminStatisticsOrdersResponseDto,
  AdminStatisticsStoresResponseDto,
  AdminStatisticsStoreEntryRequestsResponseDto,
  AdminStatisticsDailyTrendsResponseDto,
)
@Controller(`${AUDIENCE.ADMIN}/statistics`)
@Auth({ isPublic: false, audiences: [AUDIENCE.ADMIN] })
export class AdminStatisticsController {
  constructor(private readonly adminStatisticsService: AdminStatisticsService) {}

  @Get("users")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 회원 통계",
    description: "구매자·판매자 가입 현황(총계·오늘·최근 7일·30일·탈퇴)을 반환합니다.",
  })
  @SwaggerResponse(200, { dataDto: AdminStatisticsUsersResponseDto })
  @SwaggerAuthResponses()
  async getUsers() {
    return await this.adminStatisticsService.getUsers();
  }

  @Get("orders")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 주문·매출 통계",
    description: "총 주문 수, 주문 상태별 건수와 픽업 완료 기준 GMV를 반환합니다.",
  })
  @SwaggerResponse(200, { dataDto: AdminStatisticsOrdersResponseDto })
  @SwaggerAuthResponses()
  async getOrders() {
    return await this.adminStatisticsService.getOrders();
  }

  @Get("stores")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 스토어 통계",
    description:
      "스토어 등록 현황과 사업자 검증 완료 스토어 현황(총계·오늘·최근 7일·30일)을 반환합니다. 날짜 경계는 Asia/Seoul 달력일 기준입니다.",
  })
  @SwaggerResponse(200, { dataDto: AdminStatisticsStoresResponseDto })
  @SwaggerAuthResponses()
  async getStores() {
    return await this.adminStatisticsService.getStores();
  }

  @Get("store-entry-requests")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 입점 통계",
    description:
      "입점 요청 등록 현황(총계·오늘·최근 7일·30일)을 반환합니다. 날짜 경계는 Asia/Seoul 달력일 기준입니다.",
  })
  @SwaggerResponse(200, { dataDto: AdminStatisticsStoreEntryRequestsResponseDto })
  @SwaggerAuthResponses()
  async getStoreEntryRequests() {
    return await this.adminStatisticsService.getStoreEntryRequests();
  }

  @Get("daily-trends")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 일별 추이",
    description:
      "startDate·endDate(YYYY-MM-DD, Asia/Seoul) 구간의 일별 추이를 반환합니다. metrics로 signups·orders·stores·entryRequests 중 필요한 지표만 선택할 수 있습니다. 데이터가 없는 날짜는 0으로 채워집니다.",
  })
  @SwaggerResponse(200, { dataDto: AdminStatisticsDailyTrendsResponseDto })
  @SwaggerAuthResponses()
  @SwaggerResponse(400, {
    dataExample: createMessageObject(ADMIN_STATISTICS_ERROR_MESSAGES.INVALID_DATE_RANGE),
  })
  async getDailyTrends(@Query() query: AdminStatisticsDailyTrendsRequestDto) {
    return await this.adminStatisticsService.getDailyTrends(query);
  }
}
