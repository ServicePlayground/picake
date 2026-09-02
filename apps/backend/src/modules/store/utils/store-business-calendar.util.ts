import {
  STORE_BUSINESS_CALENDAR_TIMEZONE,
  STORE_BUSINESS_TIME_HHMM_REGEX,
  isStoreBusinessFullDayWindow,
} from "@apps/backend/modules/store/constants/store-business-calendar.constants";
import { StoreMapPickupPeriodKind } from "@apps/backend/modules/store/constants/store.constants";

/** 지도 오전 슬롯: 서울 00:00 이상 ~ 12:00 미만(자정~11:59) */
const MAP_MORNING_SLOT_START_MIN = 0;
const MAP_MORNING_SLOT_END_MIN = 12 * 60;
/** 지도 오후 슬롯: 서울 12:00 이상 ~ 24:00 미만(정오~23:59) */
const MAP_AFTERNOON_SLOT_START_MIN = 12 * 60;
const MAP_AFTERNOON_SLOT_END_MIN = 24 * 60;

export type StoreBusinessDayOverrideInput = {
  date: string;
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
};

export type StoreBusinessCalendarState = {
  weeklyClosedWeekdays: number[];
  standardOpenTime: string;
  standardCloseTime: string;
  dayOverrides: StoreBusinessDayOverrideInput[];
};

/**
 * Asia/Seoul 기준 달력 날짜·분·요일(0=일 … 6=토, JS Date.getDay()와 동일)
 */
export function getSeoulWallClockForPickup(pickupUtc: Date): {
  dateKey: string;
  minuteOfDay: number;
  weekday: number;
} {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: STORE_BUSINESS_CALENDAR_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    // hour12: false만 쓰면 일부 ICU가 자정대(00:00~00:59)를 "24:00~24:59"로 포맷해
    // minuteOfDay가 1440대로 계산되는 문제가 있어(getSeoulHour와 동일 사유), hourCycle로 직접 고정한다.
    hourCycle: "h23",
    weekday: "short",
  }).formatToParts(pickupUtc);

  const v = (t: Intl.DateTimeFormatPart["type"]) => parts.find((p) => p.type === t)?.value ?? "";

  const month = v("month");
  const day = v("day");
  const year = v("year");
  const dateKey = `${year}-${month}-${day}`;

  const hour = Number.parseInt(v("hour"), 10);
  const minute = Number.parseInt(v("minute"), 10);
  const minuteOfDay = hour * 60 + minute;

  const wk = v("weekday").toLowerCase().replace(/\./g, "");
  const prefix3 = wk.slice(0, 3);
  const weekdayMap: Record<string, number> = {
    sun: 0,
    mon: 1,
    tue: 2,
    wed: 3,
    thu: 4,
    fri: 5,
    sat: 6,
  };
  const weekday = weekdayMap[prefix3] ?? 0;

  return { dateKey, minuteOfDay, weekday };
}

export function parseHalfHourTimeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map((x) => Number.parseInt(x, 10));
  return h * 60 + m;
}

/**
 * 픽업 시각이 영업 창 안이면 true.
 * - open/close가 모두 00:00 → 하루 전체(0≤분<24*60)
 * - 그 외 → [open, close) (종료 시각 미포함)
 */
export function isMinuteWithinHalfHourWindow(
  minuteOfDay: number,
  openHhmm: string,
  closeHhmm: string,
): boolean {
  if (isStoreBusinessFullDayWindow(openHhmm, closeHhmm)) {
    return minuteOfDay >= 0 && minuteOfDay < 24 * 60;
  }
  const openM = parseHalfHourTimeToMinutes(openHhmm);
  const closeM = parseHalfHourTimeToMinutes(closeHhmm);
  return minuteOfDay >= openM && minuteOfDay < closeM;
}

export function isValidHalfHourHhmm(value: string): boolean {
  return STORE_BUSINESS_TIME_HHMM_REGEX.test(value);
}

/** 같은 날 [a0,a1)·[b0,b1) 반개구간 겹침(끝 미포함) */
function openMinuteIntervalsOverlap(a0: number, a1: number, b0: number, b1: number): boolean {
  return Math.max(a0, b0) < Math.min(a1, b1);
}

/**
 * 해당 서울 달력 날짜의 유효 영업 구간(분 단위, 당일 0시 기준). 휴무·미설정이면 null.
 * `isMinuteWithinHalfHourWindow`와 동일한 해석(00:00+00:00 = 하루 전체).
 */
export function getEffectiveSeoulDayOpenMinuteRange(
  state: StoreBusinessCalendarState,
  year: number,
  month1To12: number,
  day: number,
): { openMin: number; closeMin: number } | null {
  const anchor = new Date(Date.UTC(year, month1To12 - 1, day, 12 - 9, 0, 0, 0));
  const { dateKey, weekday } = getSeoulWallClockForPickup(anchor);

  const override = state.dayOverrides.find((o) => o.date === dateKey);
  if (override) {
    if (!override.isOpen) return null;
    if (!override.openTime || !override.closeTime) return null;
    if (isStoreBusinessFullDayWindow(override.openTime, override.closeTime)) {
      return { openMin: 0, closeMin: 24 * 60 };
    }
    return {
      openMin: parseHalfHourTimeToMinutes(override.openTime),
      closeMin: parseHalfHourTimeToMinutes(override.closeTime),
    };
  }

  if (state.weeklyClosedWeekdays.includes(weekday)) {
    return null;
  }

  if (isStoreBusinessFullDayWindow(state.standardOpenTime, state.standardCloseTime)) {
    return { openMin: 0, closeMin: 24 * 60 };
  }
  return {
    openMin: parseHalfHourTimeToMinutes(state.standardOpenTime),
    closeMin: parseHalfHourTimeToMinutes(state.standardCloseTime),
  };
}

/**
 * 지도 오전/오후 필터: 해당 슬롯(서울 자정~정오 / 정오~자정)과 영업 시간대가 한 시각이라도 겹치면 true.
 */
export function storeStateOverlapsMapPickupHalfDay(
  state: StoreBusinessCalendarState,
  year: number,
  month1To12: number,
  day: number,
  slot: "morning" | "afternoon",
): boolean {
  const range = getEffectiveSeoulDayOpenMinuteRange(state, year, month1To12, day);
  if (!range) return false;
  if (slot === "morning") {
    return openMinuteIntervalsOverlap(
      range.openMin,
      range.closeMin,
      MAP_MORNING_SLOT_START_MIN,
      MAP_MORNING_SLOT_END_MIN,
    );
  }
  return openMinuteIntervalsOverlap(
    range.openMin,
    range.closeMin,
    MAP_AFTERNOON_SLOT_START_MIN,
    MAP_AFTERNOON_SLOT_END_MIN,
  );
}

/**
 * YYYY-MM-DD(로컬 캘린더에서 선택한 연·월·일과 동일하게 전달) + 서울 정오 앵커 → 해당 서울 달력 날짜에
 * 영업(휴무 아님, 임시휴무 아님, 영업 시간대 정의됨)이면 true. 웹 `isStoreOpenOnSeoulCalendarDay`와 동일 규칙.
 */
export function isStoreOpenOnSeoulCalendarDayFromYmd(
  state: StoreBusinessCalendarState,
  year: number,
  month1To12: number,
  day: number,
): boolean {
  const anchor = new Date(Date.UTC(year, month1To12 - 1, day, 12 - 9, 0, 0, 0));
  const { dateKey, weekday } = getSeoulWallClockForPickup(anchor);

  const override = state.dayOverrides.find((o) => o.date === dateKey);
  if (override) {
    if (!override.isOpen) return false;
    return Boolean(override.openTime && override.closeTime);
  }

  if (state.weeklyClosedWeekdays.includes(weekday)) {
    return false;
  }

  return Boolean(state.standardOpenTime && state.standardCloseTime);
}

/**
 * 스토어 DB 행 + 지도 픽업 필터(날짜·구간).
 * - fullday: 해당 일 영업일 여부
 * - morning/afternoon: 서울 오전(00:00~12:00 미만)·오후(12:00~24:00 미만)와 영업 구간 겹침
 */
export function storeRowMatchesMapPickupFilter(
  row: {
    weeklyClosedWeekdays: number[];
    standardOpenTime: string;
    standardCloseTime: string;
    businessCalendarOverrides: unknown;
  },
  pickupDateYmd: string,
  period: StoreMapPickupPeriodKind,
): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(pickupDateYmd.trim());
  if (!m) return false;
  const y = Number.parseInt(m[1]!, 10);
  const mo = Number.parseInt(m[2]!, 10);
  const d = Number.parseInt(m[3]!, 10);
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) return false;

  const state = businessCalendarStateFromStoreRow(row);
  if (period === StoreMapPickupPeriodKind.FULLDAY) {
    return isStoreOpenOnSeoulCalendarDayFromYmd(state, y, mo, d);
  }
  if (period === StoreMapPickupPeriodKind.MORNING) {
    return storeStateOverlapsMapPickupHalfDay(state, y, mo, d, "morning");
  }
  return storeStateOverlapsMapPickupHalfDay(state, y, mo, d, "afternoon");
}

/**
 * 제안된 영업 설정 하에서 해당 픽업 시각이 ‘영업·슬롯 가능’이면 true.
 * 휴무이거나 시간 밖이면 false.
 */
export function pickupFitsBusinessCalendarState(
  pickupUtc: Date,
  state: StoreBusinessCalendarState,
): boolean {
  const { dateKey, minuteOfDay, weekday } = getSeoulWallClockForPickup(pickupUtc);

  const override = state.dayOverrides.find((o) => o.date === dateKey);
  if (override) {
    if (!override.isOpen) return false;
    if (!override.openTime || !override.closeTime) return false;
    return isMinuteWithinHalfHourWindow(minuteOfDay, override.openTime, override.closeTime);
  }

  if (state.weeklyClosedWeekdays.includes(weekday)) {
    return false;
  }

  return isMinuteWithinHalfHourWindow(minuteOfDay, state.standardOpenTime, state.standardCloseTime);
}

/** DB JSON → 정규화(날짜 오름차순, 동일 날짜는 뒤 항목 우선) */
export function normalizeDayOverridesFromJson(raw: unknown): StoreBusinessDayOverrideInput[] {
  if (!Array.isArray(raw)) return [];
  const out: StoreBusinessDayOverrideInput[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const date = typeof r.date === "string" ? r.date : "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    const isOpen = Boolean(r.isOpen);
    const openTime = typeof r.openTime === "string" ? r.openTime : undefined;
    const closeTime = typeof r.closeTime === "string" ? r.closeTime : undefined;
    out.push({ date, isOpen, openTime, closeTime });
  }
  out.sort((a, b) => a.date.localeCompare(b.date));
  const byDate = new Map<string, StoreBusinessDayOverrideInput>();
  for (const o of out) {
    byDate.set(o.date, o);
  }
  return [...byDate.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([, v]) => v);
}

export function businessCalendarStateFromStoreRow(row: {
  weeklyClosedWeekdays: number[];
  standardOpenTime: string;
  standardCloseTime: string;
  businessCalendarOverrides: unknown;
}): StoreBusinessCalendarState {
  return {
    weeklyClosedWeekdays: [...row.weeklyClosedWeekdays].sort((a, b) => a - b),
    standardOpenTime: row.standardOpenTime,
    standardCloseTime: row.standardCloseTime,
    dayOverrides: normalizeDayOverridesFromJson(row.businessCalendarOverrides),
  };
}

/** API 응답용 (휴무일은 open/close 생략 가능) */
export function toStoreBusinessCalendarApiShape(state: StoreBusinessCalendarState): {
  weeklyClosedWeekdays: number[];
  standardOpenTime: string;
  standardCloseTime: string;
  dayOverrides: StoreBusinessDayOverrideInput[];
} {
  return {
    weeklyClosedWeekdays: state.weeklyClosedWeekdays,
    standardOpenTime: state.standardOpenTime,
    standardCloseTime: state.standardCloseTime,
    dayOverrides: state.dayOverrides.map((o) => ({
      date: o.date,
      isOpen: o.isOpen,
      ...(o.isOpen ? { openTime: o.openTime, closeTime: o.closeTime } : {}),
    })),
  };
}
