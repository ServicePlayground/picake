import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { IsYmdDateString } from "@apps/backend/common/decorators/date-query.decorator";
import { SWAGGER_EXAMPLES as STORE_SWAGGER_EXAMPLES } from "@apps/backend/modules/store/constants/store.constants";

/**
 * GET /statistics/orders/overview 쿼리 (order-list.dto의 OrderListRequestDto와 같이 인바운드 요청 형태)
 */
export class SellerOrderStatisticsOverviewRequestDto {
  @ApiProperty({
    description: "스토어 ID (본인 소유 스토어만)",
    example: STORE_SWAGGER_EXAMPLES.ID,
  })
  @IsNotEmpty()
  @IsString()
  storeId: string;

  @ApiProperty({
    description: "시작일 (YYYY-MM-DD, Asia/Seoul 달력)",
    example: "2024-01-01",
  })
  @IsNotEmpty()
  @IsYmdDateString()
  startDate: string;

  @ApiProperty({
    description: "종료일 (YYYY-MM-DD, Asia/Seoul 달력, 해당일 포함)",
    example: "2024-01-31",
  })
  @IsNotEmpty()
  @IsYmdDateString()
  endDate: string;
}

/** 개요 응답 내 상품 랭킹 행 */
export class SellerOrderStatisticsProductStatDto {
  @ApiProperty()
  productId: string;

  @ApiProperty()
  productName: string;

  @ApiProperty({ description: "매출(원)" })
  revenue: number;

  @ApiProperty({ description: "주문 건수(헤더 기준)" })
  orderCount: number;
}

/** 요일 버킷 */
export class SellerOrderStatisticsWeekdayDto {
  @ApiProperty({ description: "0=일 … 6=토 (Asia/Seoul)" })
  weekday: number;

  @ApiProperty()
  label: string;

  @ApiProperty({ description: "매출 합(원) 또는 주문 건수" })
  total: number;
}

/** 시간대(시) 버킷 */
export class SellerOrderStatisticsHourlyDto {
  @ApiProperty({ description: "0–23 (Asia/Seoul)" })
  hour: number;

  @ApiProperty()
  count: number;
}

/**
 * GET /statistics/orders/overview 응답 본문
 */
export class SellerOrderStatisticsOverviewResponseDto {
  @ApiProperty({
    description: "집계에 포함된 주문 상태 (픽업 완료만)",
    isArray: true,
    example: ["PICKUP_COMPLETED"],
  })
  includedOrderStatuses: string[];

  @ApiProperty({ description: "총 매출(원)" })
  totalSales: number;

  @ApiProperty({ description: "총 주문 건수(헤더 기준)" })
  totalOrders: number;

  @ApiProperty({ type: [SellerOrderStatisticsProductStatDto] })
  topProductsByRevenue: SellerOrderStatisticsProductStatDto[];

  @ApiProperty({ type: [SellerOrderStatisticsProductStatDto] })
  topProductsByOrders: SellerOrderStatisticsProductStatDto[];

  @ApiProperty({
    description: "요일별 매출 합(원). 주문 접수 시각(`created_at`) Asia/Seoul 기준.",
    type: [SellerOrderStatisticsWeekdayDto],
  })
  weekdaySales: SellerOrderStatisticsWeekdayDto[];

  @ApiProperty({
    description: "요일별 주문 건수. 주문 접수 시각 Asia/Seoul 기준.",
    type: [SellerOrderStatisticsWeekdayDto],
  })
  weekdayOrders: SellerOrderStatisticsWeekdayDto[];

  @ApiProperty({
    description: "시간대별 주문 건수(0–23). 주문 접수 시각 Asia/Seoul 기준.",
    type: [SellerOrderStatisticsHourlyDto],
  })
  hourlyOrders: SellerOrderStatisticsHourlyDto[];

  @ApiProperty({
    description:
      "요일별 매출 합(원). 픽업 예정일시(`pickup_date`)를 Asia/Seoul 벽시계로 본 요일 기준. 픽업일이 없는 주문은 제외.",
    type: [SellerOrderStatisticsWeekdayDto],
  })
  weekdayPickupSales: SellerOrderStatisticsWeekdayDto[];

  @ApiProperty({
    description: "요일별 주문 건수. 픽업 예정일시 기준(Asia/Seoul). 픽업일이 없는 주문은 제외.",
    type: [SellerOrderStatisticsWeekdayDto],
  })
  weekdayPickupOrders: SellerOrderStatisticsWeekdayDto[];

  @ApiProperty({
    description:
      "시간대(0–23)별 주문 건수. 픽업 예정일시의 시(Asia/Seoul). 픽업일이 없는 주문은 제외.",
    type: [SellerOrderStatisticsHourlyDto],
  })
  hourlyPickupOrders: SellerOrderStatisticsHourlyDto[];
}
