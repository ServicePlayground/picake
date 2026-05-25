import type { StatusBadgeVariant } from "@/apps/web-admin/common/components/badges/StatusBadge";
import type { HomeBannerItemResponseDto } from "@/apps/web-admin/features/home-banner/types/home-banner.dto";

export type HomeBannerPeriodStatus = "active" | "scheduled" | "expired" | "hidden";

const LABELS: Record<HomeBannerPeriodStatus, string> = {
  active: "노출 중",
  scheduled: "예약",
  expired: "종료",
  hidden: "숨김",
};

export function getHomeBannerPeriodStatus(
  item: Pick<HomeBannerItemResponseDto, "isActive" | "startsAt" | "endsAt">,
  now: Date = new Date(),
): HomeBannerPeriodStatus {
  if (!item.isActive) return "hidden";
  const startsAt = item.startsAt ? new Date(item.startsAt) : null;
  const endsAt = item.endsAt ? new Date(item.endsAt) : null;
  if (startsAt && startsAt > now) return "scheduled";
  if (endsAt && endsAt < now) return "expired";
  return "active";
}

export function getHomeBannerPeriodStatusLabel(status: HomeBannerPeriodStatus): string {
  return LABELS[status] ?? status;
}

export function getHomeBannerPeriodStatusBadgeVariant(
  status: HomeBannerPeriodStatus,
): StatusBadgeVariant {
  switch (status) {
    case "active":
      return "success";
    case "scheduled":
      return "info";
    case "expired":
    case "hidden":
      return "default";
    default:
      return "default";
  }
}

export function formatHomeBannerPeriodRange(
  startsAt: string | null,
  endsAt: string | null,
): string {
  const startLabel = startsAt
    ? new Date(startsAt).toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" })
    : "즉시";
  const endLabel = endsAt
    ? new Date(endsAt).toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" })
    : "무기한";
  return `${startLabel} ~ ${endLabel}`;
}

export function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fromDatetimeLocalValue(value: string): string | null {
  if (!value.trim()) return null;
  return new Date(value).toISOString();
}
