function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * 24시간제 시:분 문자열. 분이 0이면 분은 생략한다.
 * 예: 13시 28분 / 9시 05분 / 13시 (정각)
 */
function formatTime24(d: Date): string {
  const hour = d.getHours();
  const minute = d.getMinutes();
  return minute === 0 ? `${hour}시` : `${hour}시 ${String(minute).padStart(2, "0")}분`;
}

/**
 * 알림 목록 우측 시간 영역 (로컬 타임존, 24시간제).
 * - 당일 알림: date `오늘` + `H시 M분` (예: 오늘 · 13시 28분)
 * - 그 외(과거) 알림: date `M월 D일` + `H시 M분` (예: 8월 12일 · 13시 28분)
 * - 분이 0이면 분은 표시하지 않는다 (예: 13시)
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
