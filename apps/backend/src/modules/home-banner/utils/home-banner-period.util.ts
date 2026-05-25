/**
 * 노출 기간 유효성 검증 (startsAt <= endsAt, 둘 다 있을 때)
 */
export function assertValidHomeBannerPeriod(startsAt?: Date | null, endsAt?: Date | null): void {
  if (startsAt && endsAt && startsAt > endsAt) {
    throw new Error("INVALID_DISPLAY_PERIOD");
  }
}

/** 구매자 앱 홈에 실제 노출되는지 (활성 + 기간) */
export function isHomeBannerVisibleNow(
  item: {
    isActive: boolean;
    startsAt: Date | null;
    endsAt: Date | null;
  },
  now: Date = new Date(),
): boolean {
  if (!item.isActive) return false;
  if (item.startsAt && item.startsAt > now) return false;
  if (item.endsAt && item.endsAt < now) return false;
  return true;
}
