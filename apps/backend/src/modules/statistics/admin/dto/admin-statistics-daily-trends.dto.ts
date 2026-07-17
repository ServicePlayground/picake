import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { IsYmdDateString } from "@apps/backend/common/decorators/date-query.decorator";

/**
 * GET /admin/statistics/daily-trends 쿼리
 * (판매자 주문 통계 `SellerOrderStatisticsOverviewRequestDto`와 같은 YYYY-MM-DD·Asia/Seoul 규약)
 */
export class AdminStatisticsDailyTrendsRequestDto {
  @ApiProperty({
    description: "시작일 (YYYY-MM-DD, Asia/Seoul 달력)",
    example: "2026-07-01",
  })
  @IsNotEmpty()
  @IsYmdDateString()
  startDate: string;

  @ApiProperty({
    description: "종료일 (YYYY-MM-DD, Asia/Seoul 달력, 해당일 포함)",
    example: "2026-07-31",
  })
  @IsNotEmpty()
  @IsYmdDateString()
  endDate: string;
}

/** 일별 추이 행 (구간 내 모든 날짜를 0으로 채워 반환) */
export class AdminStatisticsDailyTrendDto {
  @ApiProperty({ description: "날짜 (YYYY-MM-DD, Asia/Seoul)" })
  date: string;

  @ApiProperty({ description: "신규 구매자 가입 수" })
  newConsumers: number;

  @ApiProperty({ description: "신규 판매자 가입 수" })
  newSellers: number;

  @ApiProperty({ description: "주문 수 (모든 상태, 접수 시각 기준)" })
  orderCount: number;

  @ApiProperty({
    description: "GMV(원). 픽업 완료(PICKUP_COMPLETED) 주문의 총 금액 합 (접수 시각 기준)",
  })
  gmv: number;
}

/**
 * GET /admin/statistics/daily-trends 응답 본문
 */
export class AdminStatisticsDailyTrendsResponseDto {
  @ApiProperty({ type: [AdminStatisticsDailyTrendDto] })
  days: AdminStatisticsDailyTrendDto[];
}
