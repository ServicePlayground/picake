import { BadRequestException, Injectable } from "@nestjs/common";
import { SellerVerificationStatus } from "@apps/backend/infra/database/prisma/generated/client";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import {
  ADMIN_STATISTICS_DAILY_TRENDS_MAX_DAYS,
  ADMIN_STATISTICS_ERROR_MESSAGES,
  ADMIN_STATISTICS_GMV_ORDER_STATUSES,
  ADMIN_STATISTICS_RECENT_DAYS_LONG,
  ADMIN_STATISTICS_RECENT_DAYS_SHORT,
} from "@apps/backend/modules/statistics/admin/constants/admin-statistics.constants";
import {
  AdminStatisticsDailyTrendsRequestDto,
  AdminStatisticsDailyTrendsResponseDto,
} from "@apps/backend/modules/statistics/admin/dto/admin-statistics-daily-trends.dto";
import {
  AdminStatisticsSignupStatDto,
  AdminStatisticsOrdersResponseDto,
  AdminStatisticsStoreEntryRequestsResponseDto,
  AdminStatisticsStoresResponseDto,
  AdminStatisticsUsersResponseDto,
} from "@apps/backend/modules/statistics/admin/dto/admin-statistics-summary.dto";
import { loadAdminStatisticsDailyBuckets } from "@apps/backend/modules/statistics/admin/utils/admin-statistics-daily-buckets.util";
import { parseAdminStatisticsDailyTrendMetrics } from "@apps/backend/modules/statistics/admin/utils/admin-statistics-daily-trends.util";
import {
  getSeoulYmd,
  getSeoulYmdDaysAgo,
  kstYmdRangeToUtcBounds,
} from "@apps/backend/modules/statistics/common/utils/statistics-datetime.util";
import { koreaCalendarDayStartUtc } from "@apps/backend/modules/order/utils/order-list-query.util";

/**
 * 관리자(전사) 통계.
 * DB가 원본(source of truth)인 지표만 다룹니다 — 가입·스토어·주문(GMV)·입점 요청.
 * 행동 데이터(페이지뷰·퍼널 등)는 PostHog에서 봅니다.
 */
@Injectable()
export class AdminStatisticsService {
  constructor(private readonly prisma: PrismaService) {}

  /** 회원 통계 (GET /admin/statistics/users). */
  async getUsers(): Promise<AdminStatisticsUsersResponseDto> {
    const { todayStart, last7DaysStart, last30DaysStart } = this.getRecentDateBounds();

    const [consumers, sellers] = await Promise.all([
      this.loadSignupStat("consumer", todayStart, last7DaysStart, last30DaysStart),
      this.loadSignupStat("seller", todayStart, last7DaysStart, last30DaysStart),
    ]);

    return {
      consumers,
      sellers,
    };
  }

  /** 주문·GMV 통계 (GET /admin/statistics/orders). */
  async getOrders(): Promise<AdminStatisticsOrdersResponseDto> {
    const [total, ordersByStatus, gmvAggregate] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.groupBy({
        by: ["orderStatus"],
        _count: { _all: true },
      }),
      this.prisma.order.aggregate({
        where: { orderStatus: { in: ADMIN_STATISTICS_GMV_ORDER_STATUSES } },
        _sum: { totalPrice: true },
      }),
    ]);

    return {
      total,
      gmv: gmvAggregate._sum.totalPrice ?? 0,
      byStatus: ordersByStatus.map((group) => ({
        status: group.orderStatus,
        count: group._count._all,
      })),
    };
  }

  /**
   * 스토어 통계 (GET /admin/statistics/stores).
   * "오늘"·"최근 N일" 경계는 Asia/Seoul 달력일 기준입니다.
   */
  async getStores(): Promise<AdminStatisticsStoresResponseDto> {
    const { todayStart, last7DaysStart, last30DaysStart } = this.getRecentDateBounds();
    const businessVerifiedSeller = {
      seller: { sellerVerificationStatus: SellerVerificationStatus.BUSINESS_VERIFIED },
    };

    const [
      storeTotal,
      storesToday,
      storesLast7Days,
      storesLast30Days,
      businessVerifiedTotal,
      businessVerifiedToday,
      businessVerifiedLast7Days,
      businessVerifiedLast30Days,
    ] = await Promise.all([
      this.prisma.store.count(),
      this.prisma.store.count({ where: { createdAt: { gte: todayStart } } }),
      this.prisma.store.count({ where: { createdAt: { gte: last7DaysStart } } }),
      this.prisma.store.count({ where: { createdAt: { gte: last30DaysStart } } }),
      this.prisma.store.count({ where: businessVerifiedSeller }),
      this.prisma.store.count({
        where: { ...businessVerifiedSeller, createdAt: { gte: todayStart } },
      }),
      this.prisma.store.count({
        where: { ...businessVerifiedSeller, createdAt: { gte: last7DaysStart } },
      }),
      this.prisma.store.count({
        where: { ...businessVerifiedSeller, createdAt: { gte: last30DaysStart } },
      }),
    ]);

    return {
      stores: {
        total: storeTotal,
        today: storesToday,
        last7Days: storesLast7Days,
        last30Days: storesLast30Days,
      },
      businessVerifiedStores: {
        total: businessVerifiedTotal,
        today: businessVerifiedToday,
        last7Days: businessVerifiedLast7Days,
        last30Days: businessVerifiedLast30Days,
      },
    };
  }

  /**
   * 입점 통계 (GET /admin/statistics/store-entry-requests).
   * "오늘"·"최근 N일" 경계는 Asia/Seoul 달력일 기준입니다.
   */
  async getStoreEntryRequests(): Promise<AdminStatisticsStoreEntryRequestsResponseDto> {
    const { todayStart, last7DaysStart, last30DaysStart } = this.getRecentDateBounds();

    const [total, today, last7Days, last30Days] = await Promise.all([
      this.prisma.storeEntryRequest.count(),
      this.prisma.storeEntryRequest.count({ where: { createdAt: { gte: todayStart } } }),
      this.prisma.storeEntryRequest.count({ where: { createdAt: { gte: last7DaysStart } } }),
      this.prisma.storeEntryRequest.count({ where: { createdAt: { gte: last30DaysStart } } }),
    ]);

    return {
      storeEntryRequests: {
        total,
        today,
        last7Days,
        last30Days,
      },
    };
  }

  /**
   * 일별 추이 (GET /admin/statistics/daily-trends).
   * 신규 가입·주문·GMV·스토어·입점 요청을 Asia/Seoul 달력일로 집계합니다.
   */
  async getDailyTrends(
    query: AdminStatisticsDailyTrendsRequestDto,
  ): Promise<AdminStatisticsDailyTrendsResponseDto> {
    const { startDate, endDate } = query;

    if (startDate > endDate) {
      throw new BadRequestException(ADMIN_STATISTICS_ERROR_MESSAGES.INVALID_DATE_RANGE);
    }

    const { start, end } = kstYmdRangeToUtcBounds(startDate, endDate);
    const rangeDays = Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    if (rangeDays > ADMIN_STATISTICS_DAILY_TRENDS_MAX_DAYS) {
      throw new BadRequestException(ADMIN_STATISTICS_ERROR_MESSAGES.DATE_RANGE_TOO_LONG);
    }

    const metrics = parseAdminStatisticsDailyTrendMetrics(query.metrics);

    const days = await loadAdminStatisticsDailyBuckets(this.prisma, {
      startYmd: startDate,
      endYmd: endDate,
      start,
      end,
      gmvOrderStatuses: ADMIN_STATISTICS_GMV_ORDER_STATUSES,
      metrics,
    });

    return { days };
  }

  /**
   * 구매자/판매자 가입 현황 공통 집계.
   * total은 탈퇴 포함 전체 계정 수, withdrawn은 `withdrawn_at`이 있는 계정 수입니다.
   */
  private async loadSignupStat(
    target: "consumer" | "seller",
    todayStart: Date,
    last7DaysStart: Date,
    last30DaysStart: Date,
  ): Promise<AdminStatisticsSignupStatDto> {
    const [total, today, last7Days, last30Days, withdrawn] =
      target === "consumer"
        ? await Promise.all([
            this.prisma.consumer.count(),
            this.prisma.consumer.count({ where: { createdAt: { gte: todayStart } } }),
            this.prisma.consumer.count({ where: { createdAt: { gte: last7DaysStart } } }),
            this.prisma.consumer.count({ where: { createdAt: { gte: last30DaysStart } } }),
            this.prisma.consumer.count({ where: { withdrawnAt: { not: null } } }),
          ])
        : await Promise.all([
            this.prisma.seller.count(),
            this.prisma.seller.count({ where: { createdAt: { gte: todayStart } } }),
            this.prisma.seller.count({ where: { createdAt: { gte: last7DaysStart } } }),
            this.prisma.seller.count({ where: { createdAt: { gte: last30DaysStart } } }),
            this.prisma.seller.count({ where: { withdrawnAt: { not: null } } }),
          ]);

    return { total, today, last7Days, last30Days, withdrawn };
  }

  /** Asia/Seoul 달력일 기준 최근 구간 시작 시각 */
  private getRecentDateBounds() {
    const now = new Date();
    return {
      todayStart: koreaCalendarDayStartUtc(getSeoulYmd(now)),
      last7DaysStart: koreaCalendarDayStartUtc(
        getSeoulYmdDaysAgo(now, ADMIN_STATISTICS_RECENT_DAYS_SHORT - 1),
      ),
      last30DaysStart: koreaCalendarDayStartUtc(
        getSeoulYmdDaysAgo(now, ADMIN_STATISTICS_RECENT_DAYS_LONG - 1),
      ),
    };
  }
}
