/** 관리자 통계 DTO (백엔드 admin-statistics-*.dto와 동일 구조) */

/** 가입 현황 (구매자·판매자 공통 형태) */
export interface AdminStatisticsSignupStatDto {
  /** 총 가입 수 (탈퇴 포함 전체 계정 수) */
  total: number;
  /** 오늘(Asia/Seoul) 신규 가입 수 */
  today: number;
  /** 최근 7일(오늘 포함) 신규 가입 수 */
  last7Days: number;
  /** 최근 30일(오늘 포함) 신규 가입 수 */
  last30Days: number;
  /** 탈퇴 수 */
  withdrawn: number;
}

/** 상태별 카운트 공통 행 */
export interface AdminStatisticsStatusCountDto {
  status: string;
  count: number;
}

/** GET /admin/statistics/users 응답 */
export interface AdminStatisticsUsersResponseDto {
  consumers: AdminStatisticsSignupStatDto;
  sellers: AdminStatisticsSignupStatDto;
}

/** GET /admin/statistics/orders 응답 */
export interface AdminStatisticsOrdersResponseDto {
  total: number;
  gmv: number;
  byStatus: AdminStatisticsStatusCountDto[];
}

/** 기간별 생성 수 공통 형태 */
export interface AdminStatisticsRecentCountDto {
  total: number;
  today: number;
  last7Days: number;
  last30Days: number;
}

/** 스토어 운영 현황 */
export interface AdminStatisticsStoreOperationStatDto extends AdminStatisticsRecentCountDto {
  withLocation: number;
  withProducts: number;
  withOrders: number;
  owners: number;
  multipleStoreOwners: number;
  sellersWithoutStore: number;
}

/** 입점 요청 상위 장소 */
export interface AdminStatisticsTopEntryRequestPlaceDto {
  kakaoPlaceId: string;
  placeName: string;
  address: string | null;
  requestCount: number;
}

/** 지역별 요청 수 */
export interface AdminStatisticsRegionCountDto {
  region: string;
  count: number;
}

/** 카테고리별 요청 수 */
export interface AdminStatisticsCategoryCountDto {
  category: string;
  count: number;
}

/** 입점 요청 상세 현황 */
export interface AdminStatisticsStoreEntryRequestStatDto {
  total: number;
  today: number;
  last7Days: number;
  last30Days: number;
  uniquePlaces: number;
  pendingCount: number;
  completedCount: number;
  completionRate: number;
  byStatus: AdminStatisticsStatusCountDto[];
  topPlaces: AdminStatisticsTopEntryRequestPlaceDto[];
  topRegions: AdminStatisticsRegionCountDto[];
  topCategories: AdminStatisticsCategoryCountDto[];
}

/** GET /admin/statistics/stores 응답 */
export interface AdminStatisticsStoresResponseDto {
  stores: AdminStatisticsStoreOperationStatDto;
  sellersByVerificationStatus: AdminStatisticsStatusCountDto[];
}

/** GET /admin/statistics/store-entry-requests 응답 */
export interface AdminStatisticsStoreEntryRequestsResponseDto {
  storeEntryRequests: AdminStatisticsStoreEntryRequestStatDto;
}

/** 일별 추이 행 */
export interface AdminStatisticsDailyTrendDto {
  /** YYYY-MM-DD (Asia/Seoul) */
  date: string;
  newConsumers: number;
  newSellers: number;
  /** 주문 수 (모든 상태, 접수 시각 기준) */
  orderCount: number;
  /** GMV(원). 픽업 완료 주문의 접수일 기준 합 */
  gmv: number;
  newStores: number;
  storeEntryRequests: number;
}

/** GET /admin/statistics/daily-trends 응답 */
export interface AdminStatisticsDailyTrendsResponseDto {
  days: AdminStatisticsDailyTrendDto[];
}

/** GET /admin/statistics/daily-trends 쿼리 */
export interface AdminStatisticsDailyTrendsRequestDto {
  /** YYYY-MM-DD (Asia/Seoul) */
  startDate: string;
  /** YYYY-MM-DD (Asia/Seoul, 해당일 포함) */
  endDate: string;
  /** signups, orders, stores, entryRequests (쉼표 구분) */
  metrics?: string;
}
