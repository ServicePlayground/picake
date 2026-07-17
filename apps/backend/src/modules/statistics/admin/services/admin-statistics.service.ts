import { BadRequestException, Injectable } from "@nestjs/common";
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
  AdminStatisticsOverviewResponseDto,
  AdminStatisticsSignupStatDto,
} from "@apps/backend/modules/statistics/admin/dto/admin-statistics-overview.dto";
import { loadAdminStatisticsDailyBuckets } from "@apps/backend/modules/statistics/admin/utils/admin-statistics-daily-buckets.util";
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

  /**
   * 전사 현황 요약 (GET /admin/statistics/overview).
   * "오늘"·"최근 N일" 경계는 Asia/Seoul 달력일 기준입니다.
   */
  async getOverview(): Promise<AdminStatisticsOverviewResponseDto> {
    const now = new Date();
    const todayStart = koreaCalendarDayStartUtc(getSeoulYmd(now));
    const last7DaysStart = koreaCalendarDayStartUtc(
      getSeoulYmdDaysAgo(now, ADMIN_STATISTICS_RECENT_DAYS_SHORT - 1),
    );
    const last30DaysStart = koreaCalendarDayStartUtc(
      getSeoulYmdDaysAgo(now, ADMIN_STATISTICS_RECENT_DAYS_LONG - 1),
    );

    const [
      consumers,
      sellers,
      storeTotal,
      sellersByVerificationStatus,
      orderTotal,
      ordersByStatus,
      gmvAggregate,
      entryRequestTotal,
      entryRequestsByStatus,
    ] = await Promise.all([
      this.loadSignupStat("consumer", todayStart, last7DaysStart, last30DaysStart),
      this.loadSignupStat("seller", todayStart, last7DaysStart, last30DaysStart),
      this.prisma.store.count(),
      this.prisma.seller.groupBy({
        by: ["sellerVerificationStatus"],
        _count: { _all: true },
      }),
      this.prisma.order.count(),
      this.prisma.order.groupBy({
        by: ["orderStatus"],
        _count: { _all: true },
      }),
      this.prisma.order.aggregate({
        where: { orderStatus: { in: ADMIN_STATISTICS_GMV_ORDER_STATUSES } },
        _sum: { totalPrice: true },
      }),
      this.prisma.storeEntryRequest.count(),
      this.prisma.storeEntryRequest.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
    ]);

    return {
      consumers,
      sellers,
      stores: {
        total: storeTotal,
        sellersByVerificationStatus: sellersByVerificationStatus.map((g) => ({
          status: g.sellerVerificationStatus,
          count: g._count._all,
        })),
      },
      orders: {
        total: orderTotal,
        gmv: gmvAggregate._sum.totalPrice ?? 0,
        byStatus: ordersByStatus.map((g) => ({
          status: g.orderStatus,
          count: g._count._all,
        })),
      },
      storeEntryRequests: {
        total: entryRequestTotal,
        byStatus: entryRequestsByStatus.map((g) => ({
          status: g.status,
          count: g._count._all,
        })),
      },
    };
  }

  /**
   * 일별 추이 (GET /admin/statistics/daily-trends).
   * 신규 가입(구매자·판매자)·주문 수·GMV를 Asia/Seoul 달력일로 집계합니다.
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

    const days = await loadAdminStatisticsDailyBuckets(this.prisma, {
      startYmd: startDate,
      endYmd: endDate,
      start,
      end,
      gmvOrderStatuses: ADMIN_STATISTICS_GMV_ORDER_STATUSES,
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
}
