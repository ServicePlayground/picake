/** ISO 날짜 문자열을 한국 로케일 표시용으로 포맷 (값 없으면 `-`) */
export function formatStoreEntryRequestDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** 주소 필드를 표시용 한 줄로 합침 */
export function formatStoreEntryRequestAddress(parts: {
  roadAddress?: string | null;
  address?: string | null;
}): string {
  return parts.roadAddress || parts.address || "-";
}
