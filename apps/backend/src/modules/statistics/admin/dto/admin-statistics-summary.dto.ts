import { ApiProperty } from "@nestjs/swagger";

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

/** 기간별 생성 수 공통 형태 */
export class AdminStatisticsRecentCountDto {
  @ApiProperty({ description: "전체 수" })
  total: number;

  @ApiProperty({ description: "오늘(Asia/Seoul) 생성 수" })
  today: number;

  @ApiProperty({ description: "최근 7일(오늘 포함) 생성 수" })
  last7Days: number;

  @ApiProperty({ description: "최근 30일(오늘 포함) 생성 수" })
  last30Days: number;
}

/** 회원 통계 */
export class AdminStatisticsUsersResponseDto {
  @ApiProperty({ description: "구매자 가입 현황", type: AdminStatisticsSignupStatDto })
  consumers: AdminStatisticsSignupStatDto;

  @ApiProperty({ description: "판매자 가입 현황", type: AdminStatisticsSignupStatDto })
  sellers: AdminStatisticsSignupStatDto;
}

/** 주문·GMV 통계 */
export class AdminStatisticsOrdersResponseDto {
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

/** 스토어 통계 */
export class AdminStatisticsStoresResponseDto {
  @ApiProperty({
    description: "스토어 등록 현황 (총계·오늘·최근 7일·30일)",
    type: AdminStatisticsRecentCountDto,
  })
  stores: AdminStatisticsRecentCountDto;

  @ApiProperty({
    description:
      "사업자 검증 완료 스토어 현황 (총계·오늘·최근 7일·30일). 소유 판매자가 BUSINESS_VERIFIED인 스토어 기준.",
    type: AdminStatisticsRecentCountDto,
  })
  businessVerifiedStores: AdminStatisticsRecentCountDto;
}

/** 입점 통계 */
export class AdminStatisticsStoreEntryRequestsResponseDto {
  @ApiProperty({
    description: "입점 요청 등록 현황 (총계·오늘·최근 7일·30일)",
    type: AdminStatisticsRecentCountDto,
  })
  storeEntryRequests: AdminStatisticsRecentCountDto;
}
