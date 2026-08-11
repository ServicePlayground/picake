import type { StoreBusinessCalendar } from "@/apps/web-user/features/store/types/store.type";

export interface PickupTimeSlot {
  /** "HH:mm" */
  value: string;
  /** "오후 2:00" */
  label: string;
}

const SLOT_INTERVAL_MINUTES = 60;

function parseHhmmToMinutes(hhmm: string): number {
  const [hour, minute] = hhmm.split(":").map((v) => Number.parseInt(v, 10));
  return hour * 60 + minute;
}

function formatMinutesToLabel(minutes: number): string {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const period = hour < 12 ? "오전" : "오후";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${period} ${displayHour}:${String(minute).padStart(2, "0")}`;
}

function formatMinutesToValue(minutes: number): string {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/**
 * 선택한 날짜의 영업시간 안에서만 픽업 시간 슬롯을 만듭니다.
 * 휴무일이면 빈 배열을 반환합니다. (서버에서도 동일하게 재검증)
 */
export function buildPickupTimeSlots(
  calendar: StoreBusinessCalendar | undefined,
  dateString: string,
): PickupTimeSlot[] {
  if (!calendar || !dateString) return [];

  const override = calendar.dayOverrides.find((o) => o.date === dateString);
  let openTime = calendar.standardOpenTime;
  let closeTime = calendar.standardCloseTime;

  if (override) {
    if (!override.isOpen) return [];
    openTime = override.openTime ?? openTime;
    closeTime = override.closeTime ?? closeTime;
  } else {
    const weekday = new Date(`${dateString}T00:00:00`).getDay();
    if (calendar.weeklyClosedWeekdays.includes(weekday)) return [];
  }

  // 00:00~00:00은 하루 종일 영업을 의미
  const isFullDay = openTime === "00:00" && closeTime === "00:00";
  const openMinutes = isFullDay ? 9 * 60 : parseHhmmToMinutes(openTime);
  const closeMinutes = isFullDay ? 21 * 60 : parseHhmmToMinutes(closeTime);
  if (closeMinutes <= openMinutes) return [];

  const slots: PickupTimeSlot[] = [];
  for (let minutes = openMinutes; minutes < closeMinutes; minutes += SLOT_INTERVAL_MINUTES) {
    slots.push({ value: formatMinutesToValue(minutes), label: formatMinutesToLabel(minutes) });
  }
  return slots;
}
