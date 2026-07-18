import { Prisma, type OrderStatus } from "@apps/backend/infra/database/prisma/generated/client";
import type { PrismaService } from "@apps/backend/infra/database/prisma.service";
import {
  SELLER_ORDER_STATISTICS_WEEKDAY_INDEX_ORDER,
  SELLER_ORDER_STATISTICS_WEEKDAY_LABELS,
} from "@apps/backend/modules/statistics/seller/constants/seller-order-statistics.constants";
import type {
  SellerOrderStatisticsHourlyDto,
  SellerOrderStatisticsWeekdayDto,
} from "@apps/backend/modules/statistics/seller/dto/seller-order-statistics-overview.dto";

const SEOUL_TZ = "Asia/Seoul";

type DowRow = { dow: number; sales_sum: bigint; order_count: bigint };
type HourRow = { hour: number; order_count: bigint };

function toInt(n: bigint | number): number {
  return typeof n === "bigint" ? Number(n) : n;
}

function assembleWeekdayDtos(
  rows: DowRow[],
  field: "sales_sum" | "order_count",
): SellerOrderStatisticsWeekdayDto[] {
  const totals = Array.from({ length: 7 }, () => 0);
  for (const r of rows) {
    const d = Math.trunc(Number(r.dow));
    if (d >= 0 && d <= 6) {
      totals[d] += toInt(r[field]);
    }
  }
  return SELLER_ORDER_STATISTICS_WEEKDAY_INDEX_ORDER.map((d) => ({
    weekday: d,
    label: `${SELLER_ORDER_STATISTICS_WEEKDAY_LABELS[d]}요일`,
    total: totals[d],
  }));
}

function assembleWeekdaySalesAndOrders(rows: DowRow[]): {
  weekdaySales: SellerOrderStatisticsWeekdayDto[];
  weekdayOrders: SellerOrderStatisticsWeekdayDto[];
} {
  return {
    weekdaySales: assembleWeekdayDtos(rows, "sales_sum"),
    weekdayOrders: assembleWeekdayDtos(rows, "order_count"),
  };
}

function assembleHourlyDtos(rows: HourRow[]): SellerOrderStatisticsHourlyDto[] {
  const counts = Array.from({ length: 24 }, () => 0);
  for (const r of rows) {
    const h = Math.trunc(Number(r.hour));
    if (h >= 0 && h <= 23) {
      counts[h] += toInt(r.order_count);
    }
  }
  return counts.map((count, hour) => ({ hour, count }));
}

/**
 * PostgreSQL에서 Asia/Seoul 벽시계 기준 요일·시간대 버킷을 집계합니다.
 * `findMany` 전량 로드 없이 인덱스 친화적 GROUP BY만 수행합니다.
 */
export async function loadSellerOrderStatisticsTimeBuckets(
  prisma: PrismaService,
  params: {
    storeId: string;
    start: Date;
    end: Date;
    orderStatuses: readonly OrderStatus[];
  },
): Promise<{
  weekdaySales: SellerOrderStatisticsWeekdayDto[];
  weekdayOrders: SellerOrderStatisticsWeekdayDto[];
  hourlyOrders: SellerOrderStatisticsHourlyDto[];
  weekdayPickupSales: SellerOrderStatisticsWeekdayDto[];
  weekdayPickupOrders: SellerOrderStatisticsWeekdayDto[];
  hourlyPickupOrders: SellerOrderStatisticsHourlyDto[];
}> {
  const { storeId, start, end, orderStatuses } = params;
  const statusIn = Prisma.join(
    orderStatuses.map((s) => Prisma.sql`CAST(${s} AS "OrderStatus")`),
    ", ",
  );

  const baseWhere = Prisma.sql`
    o.store_id = ${storeId}
    AND o.created_at >= ${start}
    AND o.created_at <= ${end}
    AND o.order_status IN (${statusIn})
  `;

  const [createdDow, createdHour, pickupDow, pickupHour] = await Promise.all([
    prisma.$queryRaw<DowRow[]>(Prisma.sql`
      SELECT
        EXTRACT(DOW FROM (o.created_at AT TIME ZONE ${SEOUL_TZ}))::int AS dow,
        COALESCE(SUM(o.total_price), 0)::bigint AS sales_sum,
        COUNT(*)::bigint AS order_count
      FROM orders o
      WHERE ${baseWhere}
      GROUP BY 1
    `),
    prisma.$queryRaw<HourRow[]>(Prisma.sql`
      SELECT
        EXTRACT(HOUR FROM (o.created_at AT TIME ZONE ${SEOUL_TZ}))::int AS hour,
        COUNT(*)::bigint AS order_count
      FROM orders o
      WHERE ${baseWhere}
      GROUP BY 1
    `),
    prisma.$queryRaw<DowRow[]>(Prisma.sql`
      SELECT
        EXTRACT(DOW FROM (o.pickup_date AT TIME ZONE ${SEOUL_TZ}))::int AS dow,
        COALESCE(SUM(o.total_price), 0)::bigint AS sales_sum,
        COUNT(*)::bigint AS order_count
      FROM orders o
      WHERE ${baseWhere}
        AND o.pickup_date IS NOT NULL
      GROUP BY 1
    `),
    prisma.$queryRaw<HourRow[]>(Prisma.sql`
      SELECT
        EXTRACT(HOUR FROM (o.pickup_date AT TIME ZONE ${SEOUL_TZ}))::int AS hour,
        COUNT(*)::bigint AS order_count
      FROM orders o
      WHERE ${baseWhere}
        AND o.pickup_date IS NOT NULL
      GROUP BY 1
    `),
  ]);

  const createdWeek = assembleWeekdaySalesAndOrders(createdDow);
  const pickupWeek = assembleWeekdaySalesAndOrders(pickupDow);

  return {
    weekdaySales: createdWeek.weekdaySales,
    weekdayOrders: createdWeek.weekdayOrders,
    hourlyOrders: assembleHourlyDtos(createdHour),
    weekdayPickupSales: pickupWeek.weekdaySales,
    weekdayPickupOrders: pickupWeek.weekdayOrders,
    hourlyPickupOrders: assembleHourlyDtos(pickupHour),
  };
}
