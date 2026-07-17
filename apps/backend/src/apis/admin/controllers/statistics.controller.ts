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
import { AdminStatisticsOverviewResponseDto } from "@apps/backend/modules/statistics/admin/dto/admin-statistics-overview.dto";
import { AdminStatisticsService } from "@apps/backend/modules/statistics/admin/services/admin-statistics.service";
import { createMessageObject } from "@apps/backend/common/utils/message.util";

/**
 * 관리자 통계 컨트롤러
 *
 * 전사 현황(가입·스토어·주문·입점 요청) 집계 엔드포인트를 `/admin/statistics/...` 아래에 둡니다.
 * DB가 원본인 지표만 다루며, 행동 데이터(페이지뷰·퍼널 등)는 PostHog에서 봅니다.
 */
@ApiTags("[관리자] 통계")
@ApiExtraModels(AdminStatisticsOverviewResponseDto, AdminStatisticsDailyTrendsResponseDto)
@Controller(`${AUDIENCE.ADMIN}/statistics`)
@Auth({ isPublic: false, audiences: [AUDIENCE.ADMIN] })
export class AdminStatisticsController {
  constructor(private readonly adminStatisticsService: AdminStatisticsService) {}

  @Get("overview")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 전사 현황 요약",
    description:
      "구매자·판매자 가입 현황(총계·오늘·최근 7일·30일·탈퇴), 스토어 수·판매자 검증 상태 분포, 주문 수·상태별 건수·GMV(픽업 완료 기준), 입점 요청 상태별 건수를 반환합니다. 날짜 경계는 Asia/Seoul 달력일 기준입니다.",
  })
  @SwaggerResponse(200, { dataDto: AdminStatisticsOverviewResponseDto })
  @SwaggerAuthResponses()
  async getOverview() {
    return await this.adminStatisticsService.getOverview();
  }

  @Get("daily-trends")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 일별 추이",
    description:
      "startDate·endDate(YYYY-MM-DD, Asia/Seoul) 구간의 일별 신규 가입(구매자·판매자)·주문 수(모든 상태)·GMV(픽업 완료 주문의 접수일 기준)를 반환합니다. 데이터가 없는 날짜는 0으로 채워집니다.",
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
