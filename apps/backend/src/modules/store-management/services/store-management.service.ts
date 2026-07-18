import { Injectable, NotFoundException } from "@nestjs/common";
import { OrderStatus, Prisma } from "@apps/backend/infra/database/prisma/generated/client";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import { calculatePaginationMeta } from "@apps/backend/common/utils/pagination.util";
import { koreaCalendarDayStartUtc } from "@apps/backend/modules/order/utils/order-list-query.util";
import { getSeoulYmdDaysAgo } from "@apps/backend/modules/statistics/common/utils/statistics-datetime.util";
import { SELLER_ORDER_STATISTICS_PRODUCT_NAME_FALLBACK } from "@apps/backend/modules/statistics/seller/constants/seller-order-statistics.constants";
import {
  STORE_MANAGEMENT_DETAIL_SELECT,
  STORE_MANAGEMENT_ERROR_MESSAGES,
  STORE_MANAGEMENT_GMV_ORDER_STATUSES,
  STORE_MANAGEMENT_LIST_SELECT,
  STORE_MANAGEMENT_ORDER_STATUS_ORDER,
  STORE_MANAGEMENT_RECENT_DAYS_LONG,
  STORE_MANAGEMENT_RECENT_DAYS_SHORT,
  STORE_MANAGEMENT_TOP_PRODUCTS_LIMIT,
} from "@apps/backend/modules/store-management/constants/store-management.constants";
import {
  StoreManagementDetailResponseDto,
  StoreManagementItemResponseDto,
  StoreManagementListQueryDto,
  StoreManagementListResponseDto,
  StoreManagementRecentPeriodStatDto,
  StoreManagementStatisticsDto,
} from "@apps/backend/modules/store-management/dto/store-management.dto";
import {
  buildStoreSearchWhere,
  buildStoreSellerStatusWhere,
} from "@apps/backend/modules/store-management/utils/store-list-query.util";

type StoreListRow = Prisma.StoreGetPayload<{ select: typeof STORE_MANAGEMENT_LIST_SELECT }>;
type StoreDetailRow = Prisma.StoreGetPayload<{ select: typeof STORE_MANAGEMENT_DETAIL_SELECT }>;

/**
 * 스토어 관리(관리자) 서비스
 *
 * 관리자용 스토어 목록·상세 조회를 제공합니다.
 */
@Injectable()
export class StoreManagementService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 스토어 목록 조회 (검색·판매자 상태 필터·페이지네이션, 최신 등록순)
   */
  async list(query: StoreManagementListQueryDto): Promise<StoreManagementListResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const searchWhere = buildStoreSearchWhere(query.search);
    const sellerStatusWhere = buildStoreSellerStatusWhere(query.sellerStatus);
    const andFilters = [searchWhere, sellerStatusWhere].filter(
      (part) => Object.keys(part).length > 0,
    );
    const where: Prisma.StoreWhereInput =
      andFilters.length === 0 ? {} : andFilters.length === 1 ? andFilters[0] : { AND: andFilters };

    const [rows, totalItems] = await Promise.all([
      this.prisma.store.findMany({
        where,
        select: STORE_MANAGEMENT_LIST_SELECT,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.store.count({ where }),
    ]);

    return {
      data: rows.map((row) => this.toListItemDto(row)),
      meta: calculatePaginationMeta(page, limit, totalItems),
    };
  }

  /**
   * 스토어 상세 조회 (주문·매출 통계 포함)
   */
  async getById(storeId: string): Promise<StoreManagementDetailResponseDto> {
    const row = await this.prisma.store.findUnique({
      where: { id: storeId },
      select: STORE_MANAGEMENT_DETAIL_SELECT,
    });

    if (!row) {
      throw new NotFoundException(STORE_MANAGEMENT_ERROR_MESSAGES.STORE_NOT_FOUND);
    }

    const statistics = await this.loadStatistics(storeId);
    return this.toDetailDto(row, statistics);
  }

  /**
   * 스토어 단위 주문·매출 통계.
   * GMV·완료 주문·상위 상품은 픽업 완료(PICKUP_COMPLETED)만 집계합니다.
   */
  private async loadStatistics(storeId: string): Promise<StoreManagementStatisticsDto> {
    const { last7DaysStart, last30DaysStart } = this.getRecentDateBounds();
    const storeFilter = { storeId };
    const gmvFilter = {
      storeId,
      orderStatus: { in: STORE_MANAGEMENT_GMV_ORDER_STATUSES },
    };

    const [
      totalOrders,
      gmvAggregate,
      ordersByStatus,
      last7DaysOrders,
      last7DaysGmv,
      last30DaysOrders,
      last30DaysGmv,
      productGroups,
    ] = await Promise.all([
      this.prisma.order.count({ where: storeFilter }),
      this.prisma.order.aggregate({
        where: gmvFilter,
        _sum: { totalPrice: true },
        _count: { _all: true },
      }),
      this.prisma.order.groupBy({
        by: ["orderStatus"],
        where: storeFilter,
        _count: { _all: true },
      }),
      this.prisma.order.count({
        where: { ...storeFilter, createdAt: { gte: last7DaysStart } },
      }),
      this.prisma.order.aggregate({
        where: { ...gmvFilter, createdAt: { gte: last7DaysStart } },
        _sum: { totalPrice: true },
        _count: { _all: true },
      }),
      this.prisma.order.count({
        where: { ...storeFilter, createdAt: { gte: last30DaysStart } },
      }),
      this.prisma.order.aggregate({
        where: { ...gmvFilter, createdAt: { gte: last30DaysStart } },
        _sum: { totalPrice: true },
        _count: { _all: true },
      }),
      this.prisma.order.groupBy({
        by: ["productId"],
        where: gmvFilter,
        _sum: { totalPrice: true },
        _count: { _all: true },
        _max: { productName: true },
      }),
    ]);

    const statusCountMap = new Map<OrderStatus, number>(
      ordersByStatus.map((group) => [group.orderStatus, group._count._all]),
    );

    const topProductsByRevenue = productGroups
      .map((g) => ({
        productId: g.productId,
        productName: g._max.productName ?? SELLER_ORDER_STATISTICS_PRODUCT_NAME_FALLBACK,
        revenue: g._sum.totalPrice ?? 0,
        orderCount: g._count._all,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, STORE_MANAGEMENT_TOP_PRODUCTS_LIMIT);

    return {
      totalOrders,
      completedOrders: gmvAggregate._count._all,
      gmv: gmvAggregate._sum.totalPrice ?? 0,
      byStatus: STORE_MANAGEMENT_ORDER_STATUS_ORDER.filter((status) =>
        statusCountMap.has(status),
      ).map((status) => ({
        status,
        count: statusCountMap.get(status) ?? 0,
      })),
      last7Days: this.toRecentPeriodStat(last7DaysOrders, last7DaysGmv),
      last30Days: this.toRecentPeriodStat(last30DaysOrders, last30DaysGmv),
      topProductsByRevenue,
    };
  }

  private toRecentPeriodStat(
    orders: number,
    gmvAggregate: { _sum: { totalPrice: number | null }; _count: { _all: number } },
  ): StoreManagementRecentPeriodStatDto {
    return {
      orders,
      completedOrders: gmvAggregate._count._all,
      gmv: gmvAggregate._sum.totalPrice ?? 0,
    };
  }

  /** Asia/Seoul 달력일 기준 최근 구간 시작 시각 */
  private getRecentDateBounds() {
    const now = new Date();
    return {
      last7DaysStart: koreaCalendarDayStartUtc(
        getSeoulYmdDaysAgo(now, STORE_MANAGEMENT_RECENT_DAYS_SHORT - 1),
      ),
      last30DaysStart: koreaCalendarDayStartUtc(
        getSeoulYmdDaysAgo(now, STORE_MANAGEMENT_RECENT_DAYS_LONG - 1),
      ),
    };
  }

  private toListItemDto(row: StoreListRow): StoreManagementItemResponseDto {
    const { _count, seller, ...rest } = row;
    return {
      ...rest,
      productCount: _count.products,
      orderCount: _count.orders,
      seller,
    };
  }

  private toDetailDto(
    row: StoreDetailRow,
    statistics: StoreManagementStatisticsDto,
  ): StoreManagementDetailResponseDto {
    const { _count, seller, ...rest } = row;
    return {
      ...rest,
      productCount: _count.products,
      orderCount: _count.orders,
      feedCount: _count.feeds,
      seller,
      statistics,
    };
  }
}
