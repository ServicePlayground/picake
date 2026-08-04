function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * 24시간제 HH:mm 문자열.
 * 예: 13:28 / 09:05 / 13:00
 */
function formatTime24(d: Date): string {
  const hour = String(d.getHours()).padStart(2, "0");
  const minute = String(d.getMinutes()).padStart(2, "0");
  return `${hour}:${minute}`;
}

/**
 * 알림 목록 우측 시간 영역 (로컬 타임존, 24시간제).
 * - 당일 알림: date `오늘` + `HH:mm` (예: 오늘 13:28)
 * - 그 외(과거) 알림: date `M월 D일` + `HH:mm` (예: 8월 12일 13:28)
 *
 * "오늘" 여부는 경과 시간이 아니라 달력상 날짜(자정 경계) 기준이다.
 * 예) 밤 23시 알림은 그날은 "오늘 23시", 자정이 지나면 "M월 D일 23시"로 바뀐다.
 */
export function formatAlarmListLabels(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const now = new Date();

  if (Number.isNaN(d.getTime())) {
    return { date: "", time: "" };
  }

  const time = formatTime24(d);

  if (isSameLocalDay(d, now)) {
    return { date: "오늘", time };
  }

  return { date: `${d.getMonth() + 1}월 ${d.getDate()}일`, time };
}
