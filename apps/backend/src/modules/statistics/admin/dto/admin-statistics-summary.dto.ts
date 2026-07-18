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

/** 입점 요청 상위 장소 */
export class AdminStatisticsTopEntryRequestPlaceDto {
  @ApiProperty({ description: "카카오 장소 ID" })
  kakaoPlaceId: string;

  @ApiProperty({ description: "장소명" })
  placeName: string;

  @ApiProperty({ description: "주소", nullable: true })
  address: string | null;

  @ApiProperty({ description: "해당 장소의 요청 수" })
  requestCount: number;
}

/** 지역별 카운트 */
export class AdminStatisticsRegionCountDto {
  @ApiProperty({ description: "주소 첫 구간 기준 시·도명" })
  region: string;

  @ApiProperty({ description: "건수" })
  count: number;
}

/** 카테고리별 카운트 */
export class AdminStatisticsCategoryCountDto {
  @ApiProperty({ description: "카테고리명 (없으면 '미분류')" })
  category: string;

  @ApiProperty({ description: "건수" })
  count: number;
}

/** 입점 요청 현황 */
export class AdminStatisticsStoreEntryRequestStatDto extends AdminStatisticsRecentCountDto {
  @ApiProperty({ description: "요청된 고유 장소 수 (`kakaoPlaceId` 기준)" })
  uniquePlaces: number;

  @ApiProperty({ description: "처리 대기 건수 (`REQUESTED` + `REVIEWING`)" })
  pendingCount: number;

  @ApiProperty({ description: "입점 완료 건수 (`COMPLETED`)" })
  completedCount: number;

  @ApiProperty({ description: "입점 완료율(%, 소수 첫째 자리)" })
  completionRate: number;

  @ApiProperty({
    description: "처리 상태별 건수 (`StoreEntryRequestStatus`)",
    type: [AdminStatisticsStatusCountDto],
  })
  byStatus: AdminStatisticsStatusCountDto[];

  @ApiProperty({ description: "요청 수 상위 장소", type: [AdminStatisticsTopEntryRequestPlaceDto] })
  topPlaces: AdminStatisticsTopEntryRequestPlaceDto[];

  @ApiProperty({ description: "지역별 요청 수 상위 목록", type: [AdminStatisticsRegionCountDto] })
  topRegions: AdminStatisticsRegionCountDto[];

  @ApiProperty({
    description: "카테고리별 요청 수 상위 목록",
    type: [AdminStatisticsCategoryCountDto],
  })
  topCategories: AdminStatisticsCategoryCountDto[];
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
    description: "입점 요청 현황",
    type: AdminStatisticsStoreEntryRequestStatDto,
  })
  storeEntryRequests: AdminStatisticsStoreEntryRequestStatDto;
}
