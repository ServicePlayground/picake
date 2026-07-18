/**
 * 통계 날짜 유틸 (Asia/Seoul 달력 기준, 백엔드 통계 API의 YYYY-MM-DD 규약과 동일)
 */

const SEOUL_TZ = "Asia/Seoul";
const DAY_MS = 24 * 60 * 60 * 1000;

/** Asia/Seoul 기준 달력 날짜(YYYY-MM-DD). `en-CA` 로케일이 YYYY-MM-DD 형식을 보장 */
export function getSeoulYmd(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: SEOUL_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** 오늘 포함 최근 N일 구간의 startDate·endDate (서울은 DST가 없어 밀리초 연산으로 안전) */
export function getRecentDaysRange(days: number): { startDate: string; endDate: string } {
  const now = new Date();
  return {
    startDate: getSeoulYmd(new Date(now.getTime() - (days - 1) * DAY_MS)),
    endDate: getSeoulYmd(now),
  };
}

/** YYYY-MM-DD → 차트 축 라벨용 M/D */
export function formatYmdShort(ymd: string): string {
  const [, month, day] = ymd.split("-");
  return `${Number(month)}/${Number(day)}`;
}
