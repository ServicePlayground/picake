import type {
  StoreBusinessCalendar,
  StoreInfo,
} from "@/apps/web-user/features/store/types/store.type";
import { calculateDistance } from "@/apps/web-user/common/utils/distance.util";
import { MAP_MARKER_LABEL_TEXT_SHADOW } from "@/apps/web-user/features/store/constants/map.constant";
import {
  anchorCalendarDateToSeoulNoonInstant,
  isStoreOpenForPickupNow,
  isStoreOpenOnSeoulCalendarDay,
  storeCalendarOverlapsMapPickupHalfDay,
} from "@/apps/web-user/features/store/utils/store-business-calendar.util";
import type { StoreListPickupFilterPeriod } from "@/apps/web-user/features/store/types/store.type";

/** 지도 목록 정렬 기준 */
export type MapListSortBy = "distance" | "review";

/**
 * 지도 목록용 스토어 정렬.
 * - distance: 현재위치 기준 가까운 순 (위치 없으면 원본 순서)
 * - review: averageRating 높은 순, 동점이면 totalReviewCount 높은 순
 */
export function sortStoresForMapList(
  stores: StoreInfo[],
  sortBy: MapListSortBy,
  userLocation: { latitude: number; longitude: number } | null,
): StoreInfo[] {
  if (sortBy === "distance" && userLocation) {
    return [...stores].sort((a, b) => {
      const distA = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        a.latitude,
        a.longitude,
      );
      const distB = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        b.latitude,
        b.longitude,
      );
      return distA - distB;
    });
  }
  if (sortBy === "review") {
    return [...stores].sort((a, b) => {
      const ratingA = a.averageRating ?? 0;
      const ratingB = b.averageRating ?? 0;
      if (ratingB !== ratingA) return ratingB - ratingA;
      return (b.totalReviewCount ?? 0) - (a.totalReviewCount ?? 0);
    });
  }
  return stores;
}

/** 지도 픽업 필터: 오전·오후(서울 시각) 또는 해당 일 영업(하루종일) */
export type MapPickupFilter =
  | { kind: "morning"; date: Date }
  | { kind: "afternoon"; date: Date }
  | { kind: "fullday"; date: Date };

export type MapPickupPeriodKind = MapPickupFilter["kind"];

const MAP_PICKUP_KIND_LABEL: Record<MapPickupFilter["kind"], string> = {
  morning: "오전",
  afternoon: "오후",
  fullday: "하루종일",
};

/** 상단 검색바 등에 표시: "3월 12일" / "오후" */
export function formatMapPickupFilterForSearchBar(filter: MapPickupFilter): {
  dateLine: string;
  periodLine: string;
} {
  const d = filter.date;
  return {
    dateLine: `${d.getMonth() + 1}월 ${d.getDate()}일`,
    periodLine: MAP_PICKUP_KIND_LABEL[filter.kind],
  };
}

/** 한 줄 표기: "3월 12일 오후" */
export function formatMapPickupFilterInline(filter: MapPickupFilter): string {
  const { dateLine, periodLine } = formatMapPickupFilterForSearchBar(filter);
  return `${dateLine} ${periodLine}`;
}

/** 마커 라벨용 대표 시각(반나절 필터는 구간 전체가 아니라 표시용 중간대) */
const OVERLAY_REPRESENTATIVE_SEOUL_HOUR_MORNING = 6;
const OVERLAY_REPRESENTATIVE_SEOUL_HOUR_AFTERNOON = 18;

/** 로컬 캘린더 날짜 + 서울 시·분 → UTC instant (KST = UTC+9 고정) */
function combineLocalCalendarDateWithSeoulClock(
  selectedCalendarDate: Date,
  hourSeoul: number,
  minuteSeoul: number,
): Date {
  const y = selectedCalendarDate.getFullYear();
  const m = selectedCalendarDate.getMonth();
  const d = selectedCalendarDate.getDate();
  return new Date(Date.UTC(y, m, d, hourSeoul - 9, minuteSeoul, 0, 0));
}

export function mapPickupFilterToOverlayInstant(filter: MapPickupFilter | null): Date {
  if (!filter) return new Date();
  if (filter.kind === "fullday") {
    return anchorCalendarDateToSeoulNoonInstant(filter.date);
  }
  const h =
    filter.kind === "morning"
      ? OVERLAY_REPRESENTATIVE_SEOUL_HOUR_MORNING
      : OVERLAY_REPRESENTATIVE_SEOUL_HOUR_AFTERNOON;
  return combineLocalCalendarDateWithSeoulClock(filter.date, h, 0);
}

/** 픽업 조건 기준으로 스토어 필터. 캘린더 없으면 판단 불가로 포함 */
export function filterStoresByPickupFilter(
  stores: StoreInfo[],
  filter: MapPickupFilter | null,
): StoreInfo[] {
  if (!filter) return stores;
  return stores.filter((store) => {
    if (!store.businessCalendar) return true;
    if (filter.kind === "fullday") {
      return isStoreOpenOnSeoulCalendarDay(store.businessCalendar, filter.date);
    }
    if (filter.kind === "morning") {
      return storeCalendarOverlapsMapPickupHalfDay(store.businessCalendar, filter.date, "morning");
    }
    return storeCalendarOverlapsMapPickupHalfDay(store.businessCalendar, filter.date, "afternoon");
  });
}

/** 스토어 목록 API용 픽업 쿼리. 캘린더에서 선택한 로컬 연·월·일을 YYYY-MM-DD로 보냄(백엔드와 동일 해석). */
export function mapPickupFilterToStoreListQuery(filter: MapPickupFilter | null): {
  pickupFilterDate: string;
  pickupFilterPeriod: StoreListPickupFilterPeriod;
} | null {
  if (!filter) return null;
  const d = filter.date;
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return {
    pickupFilterDate: `${y}-${mo}-${day}`,
    pickupFilterPeriod: filter.kind,
  };
}

/** 지도 /map/search 공통 — 픽업 필터를 URL에 실을 때 쓰는 키 */
export const MAP_PICKUP_URL_DATE_KEY = "pickupDate";
export const MAP_PICKUP_URL_PERIOD_KEY = "pickupPeriod";

/** URL 쿼리 → MapPickupFilter (유효하지 않으면 null) */
export function parseMapPickupFilterFromUrlSearchParams(
  params: Pick<URLSearchParams, "get">,
): MapPickupFilter | null {
  const dateStr = params.get(MAP_PICKUP_URL_DATE_KEY);
  const period = params.get(MAP_PICKUP_URL_PERIOD_KEY);
  if (!dateStr || !period) return null;
  if (period !== "morning" && period !== "afternoon" && period !== "fullday") return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const day = Number(m[3]);
  const date = new Date(y, mo - 1, day);
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== day) {
    return null;
  }
  if (period === "morning") return { kind: "morning", date };
  if (period === "afternoon") return { kind: "afternoon", date };
  return { kind: "fullday", date };
}

const MAP_SEARCH_PATH = "/map/search";

/** 검색 입력 페이지 URL (?q·픽업 선택적) — 지도 검색 헤더 ← 로 이동할 때 사용 */
export function buildMapSearchUrlWithOptionalQuery(
  searchQuery: string | null | undefined,
  pickupFilter: MapPickupFilter | null,
): string {
  const p = new URLSearchParams();
  const q = searchQuery?.trim();
  if (q) p.set("q", q);
  const pq = mapPickupFilterToStoreListQuery(pickupFilter);
  if (pq) {
    p.set(MAP_PICKUP_URL_DATE_KEY, pq.pickupFilterDate);
    p.set(MAP_PICKUP_URL_PERIOD_KEY, pq.pickupFilterPeriod);
  }
  const s = p.toString();
  return s ? `${MAP_SEARCH_PATH}?${s}` : MAP_SEARCH_PATH;
}

/** 지도 상단에서 검색 페이지로 이동할 때 (선택 픽업이 있으면 쿼리 포함) */
export function buildMapSearchUrl(pickupFilter: MapPickupFilter | null): string {
  return buildMapSearchUrlWithOptionalQuery(null, pickupFilter);
}

const MAP_PAGE_PATH = "/map";

/** 지도 페이지 URL (?q·픽업 동시 반영) */
export function buildMapPageUrl(
  searchQuery: string | null,
  pickupFilter: MapPickupFilter | null,
): string {
  const p = new URLSearchParams();
  const q = searchQuery?.trim();
  if (q) p.set("q", q);
  const pq = mapPickupFilterToStoreListQuery(pickupFilter);
  if (pq) {
    p.set(MAP_PICKUP_URL_DATE_KEY, pq.pickupFilterDate);
    p.set(MAP_PICKUP_URL_PERIOD_KEY, pq.pickupFilterPeriod);
  }
  const s = p.toString();
  return s ? `${MAP_PAGE_PATH}?${s}` : MAP_PAGE_PATH;
}

/**
 * 라벨·마커 핀에서 동일하게 쓰는 영업 상태 (캘린더 없음 → 라벨 없음, 마커는 일반 핀).
 * @returns null이면 상태 문구 없음, true/false는 픽업 가능 여부
 */
export function getMapPlatformStoreOverlayOpenState(
  calendar: StoreBusinessCalendar | undefined,
  at: Date,
  pickupFilter: MapPickupFilter | null = null,
): boolean | null {
  if (!calendar) return null;
  if (pickupFilter == null) {
    return isStoreOpenForPickupNow(calendar, at);
  }
  if (pickupFilter.kind === "fullday") {
    return isStoreOpenOnSeoulCalendarDay(calendar, pickupFilter.date);
  }
  if (pickupFilter.kind === "morning") {
    return storeCalendarOverlapsMapPickupHalfDay(calendar, pickupFilter.date, "morning");
  }
  return storeCalendarOverlapsMapPickupHalfDay(calendar, pickupFilter.date, "afternoon");
}

/** 라벨에 '마감'이 나올 때와 동일한 조건 — 희미한 핀(map-opened-dim) 사용 */
export function shouldUseDimPlatformMapMarker(
  calendar: StoreBusinessCalendar | undefined,
  at: Date,
  pickupFilter: MapPickupFilter | null = null,
): boolean {
  return getMapPlatformStoreOverlayOpenState(calendar, at, pickupFilter) === false;
}

/** 플랫폼 스토어 마커 라벨 아래 영업 상태 HTML (픽업/예약가능 · 마감) */
export function buildMapPlatformStoreStatusOverlayHtml(
  calendar: StoreBusinessCalendar | undefined,
  at: Date,
  pickupFilter: MapPickupFilter | null = null,
): string {
  const open = getMapPlatformStoreOverlayOpenState(calendar, at, pickupFilter);
  const s = MAP_MARKER_LABEL_TEXT_SHADOW;
  if (open === null) return "";
  if (open) {
    return `<p class="text-center text-[11px] leading-[1.4] font-bold" style="color:#009BF5;text-shadow:${s}">픽업/예약가능</p>`;
  }
  return `<p class="text-center text-[11px] leading-[1.4] font-bold text-gray-500" style="text-shadow:${s}">마감</p>`;
}

/** 지도 오버레이용 텍스트 XSS 방지 이스케이프 */
export function escapeHtmlForOverlay(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** 좌표 키 (겹침 판단용, precision 5 ≈ 1m, 4 ≈ 10m) */
export function getPositionKey(lat: number, lng: number, precision = 5): string {
  return `${Number(lat).toFixed(precision)},${Number(lng).toFixed(precision)}`;
}

/** 스토어명 유사도: 한쪽이 다른 쪽을 포함하면 동일 스토어로 간주 */
export function isStoreNameSimilar(name1: string, name2: string): boolean {
  const n1 = (name1 ?? "").trim().replace(/\s+/g, " ").toLowerCase();
  const n2 = (name2 ?? "").trim().replace(/\s+/g, " ").toLowerCase();
  if (!n1 || !n2 || n1.length < 2 || n2.length < 2) return false;
  return n1.includes(n2) || n2.includes(n1);
}

/** 지도 bounds 내에 있는 스토어만 필터 (카카오 map.getBounds() 반환값 기준) */
export function getStoresInMapBounds(map: unknown, stores: StoreInfo[]): StoreInfo[] {
  const m = map as {
    getBounds?: () => {
      getSouthWest?: () => { getLat(): number; getLng(): number };
      getNorthEast?: () => { getLat(): number; getLng(): number };
    };
  };
  if (!m?.getBounds) return [];
  const bounds = m.getBounds();
  if (!bounds?.getSouthWest || !bounds?.getNorthEast) return [];
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();
  const minLat = Math.min(sw.getLat(), ne.getLat());
  const maxLat = Math.max(sw.getLat(), ne.getLat());
  const minLng = Math.min(sw.getLng(), ne.getLng());
  const maxLng = Math.max(sw.getLng(), ne.getLng());
  return stores.filter((store) => {
    if (store.latitude == null || store.longitude == null) return false;
    const { latitude: lat, longitude: lng } = store;
    return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
  });
}

/** 좌표가 있는 스토어만 필터 (타입 가드) */
export function filterStoresWithCoordinates(
  stores: StoreInfo[],
): (StoreInfo & { latitude: number; longitude: number })[] {
  return stores.filter(
    (s): s is StoreInfo & { latitude: number; longitude: number } =>
      s.latitude != null && s.longitude != null,
  );
}
