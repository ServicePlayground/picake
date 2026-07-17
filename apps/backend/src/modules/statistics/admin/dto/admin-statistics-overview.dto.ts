import { ApiProperty } from "@nestjs/swagger";

/**
 * GET /admin/statistics/overview 응답 DTO
 *
 * 관리자 대시보드용 전사 현황 요약.
 * PostHog(행동 데이터)와 달리, DB가 원본(source of truth)인 지표만 다룹니다.
 */

/** 가입 현황 (구매자·판매자 공통 형태) */
export class AdminStatisticsSignupStatDto {
  @ApiProperty({ description: "총 가입 수 (탈퇴 포함 전체 계정 수)" })
  total: number;

  @ApiProperty({ description: "오늘(Asia/Seoul) 신규 가입 수" })
  today: number;

  @ApiProperty({ description: "최근 7일(오늘 포함) 신규 가입 수" })
  last7Days: number;

  @ApiProperty({ description: "최근 30일(오늘 포함) 신규 가입 수" })
  last30Days: number;

  @ApiProperty({ description: "탈퇴 수 (`withdrawn_at`이 있는 계정)" })
  withdrawn: number;
}

/** 상태별 카운트 공통 행 (enum 값 → 건수) */
export class AdminStatisticsStatusCountDto {
  @ApiProperty({ description: "상태 값 (각 도메인 enum 문자열)" })
  status: string;

  @ApiProperty({ description: "건수" })
  count: number;
}

/** 스토어 현황 */
export class AdminStatisticsStoreStatDto {
  @ApiProperty({ description: "총 스토어 수" })
  total: number;

  @ApiProperty({
    description: "판매자 검증 상태별 판매자 수 (`SellerVerificationStatus`)",
    type: [AdminStatisticsStatusCountDto],
  })
  sellersByVerificationStatus: AdminStatisticsStatusCountDto[];
}

/** 주문·GMV 현황 */
export class AdminStatisticsOrderStatDto {
  @ApiProperty({ description: "총 주문 수 (모든 상태)" })
  total: number;

  @ApiProperty({ description: "GMV(원). 픽업 완료(PICKUP_COMPLETED) 주문의 총 금액 합" })
  gmv: number;

  @ApiProperty({
    description: "주문 상태별 건수 (`OrderStatus`)",
    type: [AdminStatisticsStatusCountDto],
  })
  byStatus: AdminStatisticsStatusCountDto[];
}

/** 입점 요청 현황 */
export class AdminStatisticsStoreEntryRequestStatDto {
  @ApiProperty({ description: "총 입점 요청 수" })
  total: number;

  @ApiProperty({
    description: "처리 상태별 건수 (`StoreEntryRequestStatus`)",
    type: [AdminStatisticsStatusCountDto],
  })
  byStatus: AdminStatisticsStatusCountDto[];
}

export class AdminStatisticsOverviewResponseDto {
  @ApiProperty({ description: "구매자 가입 현황", type: AdminStatisticsSignupStatDto })
  consumers: AdminStatisticsSignupStatDto;

  @ApiProperty({ description: "판매자 가입 현황", type: AdminStatisticsSignupStatDto })
  sellers: AdminStatisticsSignupStatDto;

  @ApiProperty({ description: "스토어 현황", type: AdminStatisticsStoreStatDto })
  stores: AdminStatisticsStoreStatDto;

  @ApiProperty({ description: "주문·GMV 현황", type: AdminStatisticsOrderStatDto })
  orders: AdminStatisticsOrderStatDto;

  @ApiProperty({
    description: "입점 요청 현황",
    type: AdminStatisticsStoreEntryRequestStatDto,
  })
  storeEntryRequests: AdminStatisticsStoreEntryRequestStatDto;
}
