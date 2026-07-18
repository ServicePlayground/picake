import { Prisma, type OrderStatus } from "@apps/backend/infra/database/prisma/generated/client";
import type { PrismaService } from "@apps/backend/infra/database/prisma.service";
import type { AdminStatisticsDailyTrendDto } from "@apps/backend/modules/statistics/admin/dto/admin-statistics-daily-trends.dto";
import type { AdminStatisticsDailyTrendMetric } from "@apps/backend/modules/statistics/admin/constants/admin-statistics.constants";

const SEOUL_TZ = "Asia/Seoul";
const DAY_MS = 24 * 60 * 60 * 1000;

type DailyCountRow = { ymd: string; count: bigint };
type DailyOrderRow = { ymd: string; order_count: bigint; gmv_sum: bigint };

function toInt(n: bigint | number): number {
  return typeof n === "bigint" ? Number(n) : n;
}

/**
 * 구간 내 모든 YYYY-MM-DD 날짜 목록 (양 끝 포함).
 * 서울은 DST가 없어 UTC 자정 기준 단순 일 단위 연산으로 안전합니다.
 */
function buildYmdRange(startYmd: string, endYmd: string): string[] {
  const start = new Date(`${startYmd}T00:00:00.000Z`).getTime();
  const end = new Date(`${endYmd}T00:00:00.000Z`).getTime();
  const days: string[] = [];
  for (let t = start; t <= end; t += DAY_MS) {
    days.push(new Date(t).toISOString().slice(0, 10));
  }
  return days;
}

/**
 * PostgreSQL에서 Asia/Seoul 달력일 기준 일별 버킷을 집계합니다.
 * (`order-statistics-time-buckets.util`과 동일하게 전량 로드 없이 GROUP BY만 수행)
 *
 * - 구매자·판매자: `created_at` 기준 신규 가입 수
 * - 주문: `created_at` 기준 전체 건수 + GMV(지정 상태만) 합
 * - 스토어·입점 요청: `created_at` 기준 신규 건수
 * - 사업자 검증 완료 스토어: 소유 판매자가 BUSINESS_VERIFIED인 스토어의 `created_at` 기준 신규 건수
 * - 구간 내 데이터가 없는 날짜는 0으로 채워 반환합니다.
 */
export async function loadAdminStatisticsDailyBuckets(
  prisma: PrismaService,
  params: {
    startYmd: string;
    endYmd: string;
    start: Date;
    end: Date;
    gmvOrderStatuses: readonly OrderStatus[];
    metrics: readonly AdminStatisticsDailyTrendMetric[];
  },
): Promise<AdminStatisticsDailyTrendDto[]> {
  const { startYmd, endYmd, start, end, gmvOrderStatuses, metrics } = params;
  const metricSet = new Set(metrics);
  const gmvStatusIn = Prisma.join(
    gmvOrderStatuses.map((s) => Prisma.sql`CAST(${s} AS "OrderStatus")`),
    ", ",
  );

  const [
    consumerRows,
    sellerRows,
    orderRows,
    storeRows,
    businessVerifiedStoreRows,
    storeEntryRequestRows,
  ] = await Promise.all([
    metricSet.has("signups")
      ? prisma.$queryRaw<DailyCountRow[]>(Prisma.sql`
          SELECT
            to_char(c.created_at AT TIME ZONE ${SEOUL_TZ}, 'YYYY-MM-DD') AS ymd,
            COUNT(*)::bigint AS count
          FROM consumers c
          WHERE c.created_at >= ${start} AND c.created_at <= ${end}
          GROUP BY 1
        `)
      : Promise.resolve([]),
    metricSet.has("signups")
      ? prisma.$queryRaw<DailyCountRow[]>(Prisma.sql`
          SELECT
            to_char(s.created_at AT TIME ZONE ${SEOUL_TZ}, 'YYYY-MM-DD') AS ymd,
            COUNT(*)::bigint AS count
          FROM sellers s
          WHERE s.created_at >= ${start} AND s.created_at <= ${end}
          GROUP BY 1
        `)
      : Promise.resolve([]),
    metricSet.has("orders")
      ? prisma.$queryRaw<DailyOrderRow[]>(Prisma.sql`
          SELECT
            to_char(o.created_at AT TIME ZONE ${SEOUL_TZ}, 'YYYY-MM-DD') AS ymd,
            COUNT(*)::bigint AS order_count,
            COALESCE(SUM(o.total_price) FILTER (WHERE o.order_status IN (${gmvStatusIn})), 0)::bigint AS gmv_sum
          FROM orders o
          WHERE o.created_at >= ${start} AND o.created_at <= ${end}
          GROUP BY 1
        `)
      : Promise.resolve([]),
    metricSet.has("stores")
      ? prisma.$queryRaw<DailyCountRow[]>(Prisma.sql`
          SELECT
            to_char(s.created_at AT TIME ZONE ${SEOUL_TZ}, 'YYYY-MM-DD') AS ymd,
            COUNT(*)::bigint AS count
          FROM stores s
          WHERE s.created_at >= ${start} AND s.created_at <= ${end}
          GROUP BY 1
        `)
      : Promise.resolve([]),
    metricSet.has("stores")
      ? prisma.$queryRaw<DailyCountRow[]>(Prisma.sql`
          SELECT
            to_char(s.created_at AT TIME ZONE ${SEOUL_TZ}, 'YYYY-MM-DD') AS ymd,
            COUNT(*)::bigint AS count
          FROM stores s
          INNER JOIN sellers se ON se.id = s.seller_id
          WHERE s.created_at >= ${start}
            AND s.created_at <= ${end}
            AND se.seller_verification_status = CAST(${"BUSINESS_VERIFIED"} AS "SellerVerificationStatus")
          GROUP BY 1
        `)
      : Promise.resolve([]),
    metricSet.has("entryRequests")
      ? prisma.$queryRaw<DailyCountRow[]>(Prisma.sql`
          SELECT
            to_char(r.created_at AT TIME ZONE ${SEOUL_TZ}, 'YYYY-MM-DD') AS ymd,
            COUNT(*)::bigint AS count
          FROM store_entry_requests r
          WHERE r.created_at >= ${start} AND r.created_at <= ${end}
          GROUP BY 1
        `)
      : Promise.resolve([]),
  ]);

  const consumerByYmd = new Map(consumerRows.map((r) => [r.ymd, toInt(r.count)]));
  const sellerByYmd = new Map(sellerRows.map((r) => [r.ymd, toInt(r.count)]));
  const orderByYmd = new Map(
    orderRows.map((r) => [r.ymd, { orderCount: toInt(r.order_count), gmv: toInt(r.gmv_sum) }]),
  );
  const storeByYmd = new Map(storeRows.map((r) => [r.ymd, toInt(r.count)]));
  const businessVerifiedStoreByYmd = new Map(
    businessVerifiedStoreRows.map((r) => [r.ymd, toInt(r.count)]),
  );
  const storeEntryRequestByYmd = new Map(storeEntryRequestRows.map((r) => [r.ymd, toInt(r.count)]));

  return buildYmdRange(startYmd, endYmd).map((date) => ({
    date,
    newConsumers: consumerByYmd.get(date) ?? 0,
    newSellers: sellerByYmd.get(date) ?? 0,
    orderCount: orderByYmd.get(date)?.orderCount ?? 0,
    gmv: orderByYmd.get(date)?.gmv ?? 0,
    newStores: storeByYmd.get(date) ?? 0,
    newBusinessVerifiedStores: businessVerifiedStoreByYmd.get(date) ?? 0,
    storeEntryRequests: storeEntryRequestByYmd.get(date) ?? 0,
  }));
}
