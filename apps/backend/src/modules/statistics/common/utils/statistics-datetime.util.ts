import {
  koreaCalendarDayEndUtc,
  koreaCalendarDayStartUtc,
} from "@apps/backend/modules/order/utils/order-list-query.util";
import { STORE_BUSINESS_CALENDAR_TIMEZONE } from "@apps/backend/modules/store/constants/store-business-calendar.constants";

/**
 * 통계 모듈 전용 날짜·시각 유틸.
 *
 * - **달력 일 경계**: 주문 목록의 픽업일 필터와 동일하게 `order-list-query.util`의
 *   `koreaCalendarDayStartUtc` / `koreaCalendarDayEndUtc`(+09:00)를 사용해 이중 구현을 피합니다.
 * - **벽시계(요일·시)**: `Intl` + 스토어 영업 캘린더와 같은 `Asia/Seoul` 상수를 사용합니다.
 *
 * 주문 상태 자동 전환용 시각은 `order/utils/order-datetime.util.ts`를 씁니다.
 */

/**
 * YYYY-MM-DD(한국 달력) 구간을 UTC `Date` 경계로 변환합니다.
 * Prisma `created_at` 등 `gte`/`lte`에 그대로 넣을 수 있습니다.
 */
export function kstYmdRangeToUtcBounds(
  startYmd: string,
  endYmd: string,
): { start: Date; end: Date } {
  return {
    start: koreaCalendarDayStartUtc(startYmd),
    end: koreaCalendarDayEndUtc(endYmd),
  };
}

/**
 * Asia/Seoul 기준 달력 날짜(YYYY-MM-DD).
 * `en-CA` 로케일이 YYYY-MM-DD 형식을 보장합니다. (관리자 통계의 "오늘"·"최근 N일" 경계 계산용)
 */
export function getSeoulYmd(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: STORE_BUSINESS_CALENDAR_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * 기준 시각에서 `days`일 전 시각의 Asia/Seoul 달력 날짜(YYYY-MM-DD).
 * 서울은 DST가 없어 단순 밀리초 연산으로 안전합니다.
 */
export function getSeoulYmdDaysAgo(date: Date, days: number): string {
  return getSeoulYmd(new Date(date.getTime() - days * DAY_MS));
}

/** `en-US` + `weekday: short` → Sun, Mon, … (로케일 고정으로 파싱 안정화) */
const WEEKDAY_SHORT_TO_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

/**
 * Asia/Seoul 기준 요일.
 * @returns ECMA `Date#getDay()` 규약: 0=일 … 6=토. 파싱 실패 시 `null`.
 */
export function getSeoulWeekday(date: Date): number | null {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: STORE_BUSINESS_CALENDAR_TIMEZONE,
    weekday: "short",
  }).formatToParts(date);
  const wd = parts.find((p) => p.type === "weekday")?.value;
  if (!wd) {
    return null;
  }
  const idx = WEEKDAY_SHORT_TO_INDEX[wd];
  return idx !== undefined ? idx : null;
}

/**
 * Asia/Seoul 기준 시각의 시(0–23).
 * `hour12: false`로 24시간제 문자열을 받아 파싱합니다. 일부 환경의 자정 `24` 표기는 0으로 취급합니다.
 */
export function getSeoulHour(date: Date): number | null {
  const raw = new Intl.DateTimeFormat("en-GB", {
    timeZone: STORE_BUSINESS_CALENDAR_TIMEZONE,
    hour: "numeric",
    hour12: false,
  }).format(date);
  const h = Number.parseInt(raw, 10);
  if (!Number.isFinite(h)) {
    return null;
  }
  if (h === 24) {
    return 0;
  }
  if (h < 0 || h > 23) {
    return null;
  }
  return h;
}
