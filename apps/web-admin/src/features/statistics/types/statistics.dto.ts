/**
 * 통계(전사 현황) DTO (백엔드 admin-statistics-*.dto와 동일 구조)
 */

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

/** 스토어 현황 */
export interface AdminStatisticsStoreStatDto {
  total: number;
  /** 판매자 검증 상태별 판매자 수 (`SellerVerificationStatus`) */
  sellersByVerificationStatus: AdminStatisticsStatusCountDto[];
}

/** 주문·GMV 현황 */
export interface AdminStatisticsOrderStatDto {
  /** 총 주문 수 (모든 상태) */
  total: number;
  /** GMV(원). 픽업 완료 주문의 총 금액 합 */
  gmv: number;
  /** 주문 상태별 건수 (`OrderStatus`) */
  byStatus: AdminStatisticsStatusCountDto[];
}

/** 입점 요청 현황 */
export interface AdminStatisticsStoreEntryRequestStatDto {
  total: number;
  /** 처리 상태별 건수 (`StoreEntryRequestStatus`) */
  byStatus: AdminStatisticsStatusCountDto[];
}

/** GET /admin/statistics/overview 응답 */
export interface AdminStatisticsOverviewResponseDto {
  consumers: AdminStatisticsSignupStatDto;
  sellers: AdminStatisticsSignupStatDto;
  stores: AdminStatisticsStoreStatDto;
  orders: AdminStatisticsOrderStatDto;
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
}
