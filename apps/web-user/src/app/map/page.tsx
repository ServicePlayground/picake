"use client";

/**
 * 지도 페이지
 * - 플랫폼 입점 스토어: API 전체 조회 후 현재 지도 범위 내 마커 표시
 * - URL ?q= 검색 시: 스토어 검색 API로 결과 표시 + 목록 패널 자동 오픈
 * - 카카오 키워드 검색: 주변 미입점 마커 (플랫폼과 겹치면 제외)
 * - 현재위치: 있으면 중심, 없으면 강남구 / 버튼으로 재요청
 * - 픽업 날짜·구간(하루종일/오전/오후) 필터: 영업 캘린더 기준으로 마커·목록·라벨 반영
 */
import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useRouter, useSearchParams } from "next/navigation";
import { BottomNav } from "@/apps/web-user/common/components/navigation/BottomNav";
import { useUserLocation } from "@/apps/web-user/common/hooks/useUserLocation";
import { Icon } from "@/apps/web-user/common/components/icons";
import { storeApi } from "@/apps/web-user/features/store/apis/store.api";
import type { StoreInfo, StoreListFilter } from "@/apps/web-user/features/store/types/store.type";
import { MapStoreCard } from "@/apps/web-user/features/store/components/map/MapStoreCard";
import { MapStoreListSection } from "@/apps/web-user/features/store/components/map/MapStoreListSection";
import { MapTopSearchBar } from "@/apps/web-user/features/store/components/map/MapTopSearchBar";
import { MapPickupDateBottomSheet } from "@/apps/web-user/features/store/components/map/MapPickupDateBottomSheet";
import { MapListSheetPanel } from "@/apps/web-user/features/store/components/map/MapListSheetPanel";
import { useMapListSheet } from "@/apps/web-user/features/store/hooks/useMapListSheet";
import {
  DEFAULT_MAP_CENTER,
  MAP_BOUNDS_PADDING,
  KAKAO_PLACES_KEYWORD,
  MAP_MARKER_LABEL_TEXT_SHADOW,
  MAP_SELECTED_STORE_CARD_BOTTOM,
} from "@/apps/web-user/features/store/constants/map.constant";
import {
  escapeHtmlForOverlay,
  getPositionKey,
  isStoreNameSimilar,
  getStoresInMapBounds,
  filterStoresWithCoordinates,
  mapPickupFilterToOverlayInstant,
  mapPickupFilterToStoreListQuery,
  buildMapPlatformStoreStatusOverlayHtml,
  shouldUseDimPlatformMapMarker,
  buildMapPageUrl,
  parseMapPickupFilterFromUrlSearchParams,
  MAP_PICKUP_URL_DATE_KEY,
  MAP_PICKUP_URL_PERIOD_KEY,
  type MapListSortBy,
  type MapPickupFilter,
} from "@/apps/web-user/features/store/utils/map.util";
import {
  isStoreOpenOnSeoulCalendarDay,
  storeCalendarOverlapsMapPickupHalfDay,
} from "@/apps/web-user/features/store/utils/store-business-calendar.util";

declare global {
  interface Window {
    kakao: any;
  }
}

export default function MapPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q")?.trim() || null;
  const kakaoJavascriptKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY;
  const { location: userLocation, refresh: refreshUserLocation } = useUserLocation();

  const [kakaoLoaded, setKakaoLoaded] = useState(false);
  const [selectedStore, setSelectedStore] = useState<StoreInfo | null>(null);
  const [listSortBy, setListSortBy] = useState<MapListSortBy>("distance");
  const [listFilter, setListFilter] = useState<StoreListFilter>({});
  const [pickupFilter, setPickupFilter] = useState<MapPickupFilter | null>(null);
  const [pickupCalendarOpen, setPickupCalendarOpen] = useState(false);

  /** URL에 픽업이 있으면 상태에 반영 (검색 페이지 등에서 돌아올 때) */
  useEffect(() => {
    const hasPickupInUrl =
      searchParams.has(MAP_PICKUP_URL_DATE_KEY) && searchParams.has(MAP_PICKUP_URL_PERIOD_KEY);
    if (!hasPickupInUrl) return;
    const parsed = parseMapPickupFilterFromUrlSearchParams(searchParams);
    setPickupFilter(parsed);
  }, [searchParams]);

  /** 픽업/검색어와 URL을 맞춤 */
  const applyPickupToUrl = useCallback(
    (next: MapPickupFilter | null) => {
      router.replace(buildMapPageUrl(searchQuery, next));
    },
    [router, searchQuery],
  );

  const handlePickupConfirm = useCallback(
    (f: MapPickupFilter) => {
      setPickupFilter(f);
      applyPickupToUrl(f);
    },
    [applyPickupToUrl],
  );

  const handlePickupClear = useCallback(() => {
    setPickupFilter(null);
    applyPickupToUrl(null);
  }, [applyPickupToUrl]);

  // ---- Refs: 지도·마커 ----
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any | null>(null);
  const placesServiceRef = useRef<any | null>(null);
  const markersRef = useRef<any[]>([]); // 카카오 키워드 검색(미입점) 마커
  const overlaysRef = useRef<any[]>([]); // 미입점 마커 이름 오버레이
  const platformMarkersRef = useRef<any[]>([]); // 플랫폼 입점 스토어 마커
  const platformOverlaysRef = useRef<any[]>([]); // 플랫폼 스토어 이름 오버레이
  const platformStoresRef = useRef<StoreInfo[]>([]); // API 전체 스토어 캐시
  const searchStoresRef = useRef<StoreInfo[] | null>(null); // null=검색아님, []=검색결과0개, [...]=검색결과
  const markerImageRef = useRef<any | null>(null);
  const focusedMarkerImageRef = useRef<any | null>(null);
  const openedMarkerImageRef = useRef<any | null>(null);
  const openedFocusedMarkerImageRef = useRef<any | null>(null);
  const openedDimMarkerImageRef = useRef<any | null>(null);
  const openedDimFocusedMarkerImageRef = useRef<any | null>(null);
  /** drawPlatformStoreMarkers와 동일 순서 — 마감(희미 핀) 여부 */
  const platformMarkerDimFlagsRef = useRef<boolean[]>([]);
  const selectedMarkerRef = useRef<any | null>(null);
  const isCenteringFromClickRef = useRef(false); // 마커 클릭으로 panTo 한 직후 idle에서 재처리 방지
  const usedUserLocationForCenterRef = useRef(false); // 이미 현재위치로 중심 잡았는지
  const userLocationOverlayRef = useRef<any | null>(null);
  const userLocationRef = useRef<{ latitude: number; longitude: number } | null>(null); // load 콜백에서 최신 위치 참조용
  const searchQueryRef = useRef<string | null>(searchQuery);
  const pickupFilterRef = useRef<MapPickupFilter | null>(pickupFilter);
  searchQueryRef.current = searchQuery;
  pickupFilterRef.current = pickupFilter;

  // 목록에 쓸 스토어: 검색 모드면 검색 결과 중 지도 범위 내, 아니면 지도 범위 내 플랫폼 스토어(픽업 필터는 API에서 반영)
  const getStoresForList = useCallback((): StoreInfo[] => {
    const map = mapInstanceRef.current;
    if (!map) return [];
    const source =
      searchStoresRef.current !== null ? searchStoresRef.current : platformStoresRef.current;
    return getStoresInMapBounds(map, source);
  }, []);

  const getStoresForListRef = useRef(getStoresForList);
  getStoresForListRef.current = getStoresForList;

  const listSheet = useMapListSheet(getStoresForList); // 하단 목록 시트(드래그 패널) 상태

  const {
    listSheetStores,
    setListSheetStores,
    listSheetPanelOffset,
    setListSheetPanelOffset,
    isListSheetPanelDragging,
    listSheetPanelOffsetRef,
    listSheetPanelMaxOffsetRef,
    getListSheetMaxOffset,
    getListSheetMiddleOffset,
    openListSheet,
    closeListSheet,
    handlePointerDown: listSheetHandlePointerDown,
    handlePointerMove: listSheetHandlePointerMove,
    handlePointerUp: listSheetHandlePointerUp,
  } = listSheet;

  // ---- 지도 범위 내 스토어 (마커 표시용): 검색 모드면 검색 결과만, 아니면 지도 범위 내 플랫폼 스토어(픽업 필터는 API에서 반영)
  const getStoresToShow = useCallback((map: any): StoreInfo[] => {
    return searchStoresRef.current !== null
      ? searchStoresRef.current
      : getStoresInMapBounds(map, platformStoresRef.current);
  }, []);

  /** 카카오 검색 장소가 플랫폼 스토어와 같은 위치/이름이면 미입점 마커에서 제외 */
  const isPlatformStoreDuplicate = useCallback((lat: number, lng: number, placeName: string) => {
    return platformStoresRef.current.some((s) => {
      const samePos =
        getPositionKey(lat, lng, 5) === getPositionKey(s.latitude!, s.longitude!, 5) ||
        getPositionKey(lat, lng, 4) === getPositionKey(s.latitude!, s.longitude!, 4);
      if (!samePos) return false;
      return isStoreNameSimilar(placeName, s.name ?? "");
    });
  }, []);

  /** 미입점(카카오 키워드 검색) 마커·오버레이만 제거, 플랫폼 마커는 유지 */
  const clearKakaoMarkers = useCallback(() => {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    overlaysRef.current.forEach((o) => o.setMap(null));
    overlaysRef.current = [];
    platformMarkersRef.current.forEach((m, i) => {
      const dim = platformMarkerDimFlagsRef.current[i];
      if (dim && openedDimMarkerImageRef.current) m.setImage(openedDimMarkerImageRef.current);
      else if (openedMarkerImageRef.current) m.setImage(openedMarkerImageRef.current);
    });
    selectedMarkerRef.current = null;
  }, []);

  /** 검색 모드면 검색 결과 전체, 아니면 현재 지도 bounds 내 플랫폼 스토어만 마커로 그림 */
  const drawPlatformStoreMarkers = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!window.kakao?.maps || !map) return;

    platformMarkersRef.current.forEach((m) => m.setMap(null));
    platformMarkersRef.current = [];
    platformOverlaysRef.current.forEach((o) => o.setMap(null));
    platformOverlaysRef.current = [];

    const stores = getStoresToShow(map);
    if (stores.length === 0) return;

    if (!openedMarkerImageRef.current) {
      openedMarkerImageRef.current = new window.kakao.maps.MarkerImage(
        "/images/contents/map-opened.png",
        new window.kakao.maps.Size(32, 37),
        { offset: new window.kakao.maps.Point(16, 37) },
      );
    }
    if (!openedFocusedMarkerImageRef.current) {
      openedFocusedMarkerImageRef.current = new window.kakao.maps.MarkerImage(
        "/images/contents/map-opened-focus.png",
        new window.kakao.maps.Size(35, 40),
        { offset: new window.kakao.maps.Point(17.5, 40) },
      );
    }
    if (!openedDimMarkerImageRef.current) {
      openedDimMarkerImageRef.current = new window.kakao.maps.MarkerImage(
        "/images/contents/map-opened-dim.png",
        new window.kakao.maps.Size(32, 37),
        { offset: new window.kakao.maps.Point(16, 37) },
      );
    }
    if (!openedDimFocusedMarkerImageRef.current) {
      openedDimFocusedMarkerImageRef.current = new window.kakao.maps.MarkerImage(
        "/images/contents/map-opened-dim-focus.png",
        new window.kakao.maps.Size(35, 40),
        { offset: new window.kakao.maps.Point(17.5, 40) },
      );
    }

    const statusAt = mapPickupFilterToOverlayInstant(pickupFilter);
    platformMarkerDimFlagsRef.current = [];

    stores.forEach((store) => {
      if (store.latitude == null || store.longitude == null) return;
      const useDim = shouldUseDimPlatformMapMarker(store.businessCalendar, statusAt, pickupFilter);
      platformMarkerDimFlagsRef.current.push(useDim);
      const defaultMarkerImage = useDim
        ? openedDimMarkerImageRef.current
        : openedMarkerImageRef.current;
      const position = new window.kakao.maps.LatLng(store.latitude, store.longitude);
      const marker = new window.kakao.maps.Marker({
        map,
        position,
        image: defaultMarkerImage,
      });
      platformMarkersRef.current.push(marker);

      window.kakao.maps.event.addListener(marker, "click", () => {
        if (markerImageRef.current)
          markersRef.current.forEach((m) => m.setImage(markerImageRef.current));
        platformMarkersRef.current.forEach((m, i) => {
          const dim = platformMarkerDimFlagsRef.current[i];
          if (dim && openedDimMarkerImageRef.current) m.setImage(openedDimMarkerImageRef.current);
          else if (openedMarkerImageRef.current) m.setImage(openedMarkerImageRef.current);
        });
        const focusedImg = useDim
          ? openedDimFocusedMarkerImageRef.current
          : openedFocusedMarkerImageRef.current;
        if (focusedImg) {
          marker.setImage(focusedImg);
          selectedMarkerRef.current = marker;
        }
        if (map?.panTo) {
          isCenteringFromClickRef.current = true;
          map.panTo(position);
        }
        if (listSheetPanelOffsetRef.current > 0) closeListSheet();
        setSelectedStore(store);
      });

      const safeName = escapeHtmlForOverlay(store.name ?? "");
      const statusHtml = buildMapPlatformStoreStatusOverlayHtml(
        store.businessCalendar,
        statusAt,
        pickupFilter,
      );
      const overlay = new window.kakao.maps.CustomOverlay({
        map,
        position,
        yAnchor: 0,
        content: `<div class="flex flex-col items-center pointer-events-none" style="margin-top:-4px;"><p class="text-center text-[14px] leading-[1.4] font-bold text-gray-900" style="text-shadow:${MAP_MARKER_LABEL_TEXT_SHADOW}">${safeName}</p>${statusHtml}</div>`,
      });
      platformOverlaysRef.current.push(overlay);
    });
  }, [getStoresToShow, pickupFilter, closeListSheet]);

  const drawPlatformStoreMarkersRef = useRef(drawPlatformStoreMarkers);
  drawPlatformStoreMarkersRef.current = drawPlatformStoreMarkers;

  /** 영업 상태 라벨이 시간 경과에 맞게 갱신되도록 1분마다 플랫폼 마커·오버레이 재생성 */
  useEffect(() => {
    const id = window.setInterval(() => {
      drawPlatformStoreMarkersRef.current();
    }, 60_000);
    return () => window.clearInterval(id);
  }, []);

  /** 현재위치 오버레이(점) 표시/제거 */
  const updateUserLocationMarker = useCallback(
    (location: { latitude: number; longitude: number } | null) => {
      const map = mapInstanceRef.current;
      if (!window.kakao?.maps || !map) return;
      if (userLocationOverlayRef.current) {
        userLocationOverlayRef.current.setMap(null);
        userLocationOverlayRef.current = null;
      }
      if (!location) return;
      const position = new window.kakao.maps.LatLng(location.latitude, location.longitude);
      userLocationOverlayRef.current = new window.kakao.maps.CustomOverlay({
        map,
        position,
        content:
          '<img src="/images/contents/map-current-position.png" alt="현재 위치" style="width:34px;height:34px;pointer-events:none;display:block" />',
        yAnchor: 0.5,
        xAnchor: 0.5,
      });
    },
    [],
  );

  /** 카카오 키워드 검색으로 주변 미입점(주문제작 케이크) 마커 표시. 지도 검색·픽업 필터 시에는 표시하지 않음. */
  const searchPlaces = useCallback(
    (centerLatLng: any) => {
      if (searchQueryRef.current || pickupFilterRef.current != null) {
        clearKakaoMarkers();
        return;
      }
      if (!window.kakao?.maps?.services) return;
      if (!placesServiceRef.current)
        placesServiceRef.current = new window.kakao.maps.services.Places();
      if (!markerImageRef.current) {
        markerImageRef.current = new window.kakao.maps.MarkerImage(
          "/images/contents/map-unopened.png",
          new window.kakao.maps.Size(32, 37),
          { offset: new window.kakao.maps.Point(16, 37) },
        );
      }
      if (!focusedMarkerImageRef.current) {
        focusedMarkerImageRef.current = new window.kakao.maps.MarkerImage(
          "/images/contents/map-unopened-focus.png",
          new window.kakao.maps.Size(35, 40),
          { offset: new window.kakao.maps.Point(17.5, 40) },
        );
      }

      placesServiceRef.current.keywordSearch(
        KAKAO_PLACES_KEYWORD,
        (data: any[], status: string) => {
          if (status !== window.kakao.maps.services.Status.OK || !Array.isArray(data)) {
            clearKakaoMarkers();
            return;
          }
          const map = mapInstanceRef.current;
          if (!map) return;
          clearKakaoMarkers();
          data.forEach((place) => {
            const lat = Number(place.y);
            const lng = Number(place.x);
            if (isPlatformStoreDuplicate(lat, lng, place.place_name ?? "")) return;
            const position = new window.kakao.maps.LatLng(lat, lng);
            const marker = new window.kakao.maps.Marker({
              map,
              position,
              image: markerImageRef.current,
            });
            markersRef.current.push(marker);
            window.kakao.maps.event.addListener(marker, "click", () => {
              setSelectedStore(null);
              if (markerImageRef.current)
                markersRef.current.forEach((m) => m.setImage(markerImageRef.current));
              platformMarkersRef.current.forEach((m, i) => {
                const dim = platformMarkerDimFlagsRef.current[i];
                if (dim && openedDimMarkerImageRef.current)
                  m.setImage(openedDimMarkerImageRef.current);
                else if (openedMarkerImageRef.current) m.setImage(openedMarkerImageRef.current);
              });
              if (focusedMarkerImageRef.current) {
                marker.setImage(focusedMarkerImageRef.current);
                selectedMarkerRef.current = marker;
              }
              if (map?.panTo) {
                isCenteringFromClickRef.current = true;
                map.panTo(position);
              }
            });
            const safeName = escapeHtmlForOverlay(place.place_name ?? "");
            overlaysRef.current.push(
              new window.kakao.maps.CustomOverlay({
                map,
                position,
                yAnchor: 0,
                content: `<div class="flex flex-col items-center pointer-events-none" style="margin-top:-4px;"><p class="text-center text-[14px] leading-[1.4] font-bold text-gray-900" style="text-shadow:${MAP_MARKER_LABEL_TEXT_SHADOW}">${safeName}</p><p class="text-center text-[11px] leading-[1.4] font-bold text-gray-500" style="text-shadow:${MAP_MARKER_LABEL_TEXT_SHADOW}">미입점</p></div>`,
              }),
            );
          });
        },
        { location: centerLatLng, useMapBounds: true },
      );
    },
    [clearKakaoMarkers, isPlatformStoreDuplicate],
  );

  /** URL 검색 또는 픽업 필터 시 미입점 마커 제거, 해제 시에만 키워드 검색 재실행 */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!mapInstanceRef.current || !window.kakao?.maps) return;
    const suppress = Boolean(searchQuery || pickupFilter);
    if (suppress) {
      clearKakaoMarkers();
    } else if (searchStoresRef.current === null) {
      searchPlaces(mapInstanceRef.current.getCenter());
    }
  }, [searchQuery, pickupFilter, clearKakaoMarkers, searchPlaces]);

  /** 지도 최초 중심: 현재위치 있으면 그곳, 없으면 강남구 */
  const getInitialCenter = useCallback((): { lat: number; lng: number } => {
    if (userLocation) {
      usedUserLocationForCenterRef.current = true;
      return { lat: userLocation.latitude, lng: userLocation.longitude };
    }
    return DEFAULT_MAP_CENTER;
  }, [userLocation]);

  /**
   * 카카오 지도 생성 및 이벤트 등록.
   * suppressKakaoUnopenedMarkers: true면 미입점 검색(searchPlaces) 호출 안 함(지도 검색·픽업 필터와 동일).
   */
  const initializeMap = useCallback(
    (center: { lat: number; lng: number }, suppressKakaoUnopenedMarkers: boolean) => {
      if (!window.kakao?.maps || !mapContainerRef.current || mapInstanceRef.current) return;
      window.kakao.maps.load(() => {
        const map = new window.kakao.maps.Map(mapContainerRef.current, {
          center: new window.kakao.maps.LatLng(center.lat, center.lng),
          level: 5,
        });
        mapInstanceRef.current = map;

        if (suppressKakaoUnopenedMarkers) clearKakaoMarkers();
        drawPlatformStoreMarkersRef.current();
        if (!suppressKakaoUnopenedMarkers) {
          searchPlaces(new window.kakao.maps.LatLng(center.lat, center.lng));
        }
        // load 콜백은 비동기라 클로저의 userLocation이 null일 수 있음 → ref로 최신 위치 사용
        updateUserLocationMarker(userLocationRef.current ?? null);

        // 지도 이동/줌 종료 시: 마커 갱신, 목록 패널이 열려 있으면 범위 내 스토어로 목록 갱신
        window.kakao.maps.event.addListener(map, "idle", () => {
          if (isCenteringFromClickRef.current) {
            isCenteringFromClickRef.current = false;
            return;
          }
          drawPlatformStoreMarkersRef.current();
          const allowKakaoUnopened =
            searchStoresRef.current === null &&
            !searchQueryRef.current &&
            pickupFilterRef.current == null;
          if (allowKakaoUnopened) searchPlaces(map.getCenter());
          if (listSheetPanelOffsetRef.current > 0) {
            setListSheetStores(getStoresForListRef.current());
          }
          // 검색 모드가 아니고, 현재 보이는 범위에 스토어가 없으면 목록 패널 접기
          if (
            searchStoresRef.current === null &&
            getStoresForListRef.current().length === 0 &&
            listSheetPanelOffsetRef.current > 0
          ) {
            closeListSheet();
          }
        });

        window.kakao.maps.event.addListener(map, "click", () => {
          setSelectedStore(null);
          if (listSheetPanelOffsetRef.current > 0) closeListSheet();
        });

        // URL 검색으로 진입한 경우: 지도 생성 시점에 이미 검색 결과가 있으면 bounds/중심·목록 패널 적용
        const stores = searchStoresRef.current;
        if (stores !== null) {
          if (stores.length > 0 && window.kakao.maps.LatLngBounds) {
            const bounds = new window.kakao.maps.LatLngBounds();
            stores.forEach((s) =>
              bounds.extend(new window.kakao.maps.LatLng(s.latitude!, s.longitude!)),
            );
            map.setBounds(bounds, MAP_BOUNDS_PADDING);
          } else if (stores.length === 0) {
            const loc = userLocationRef.current;
            const center =
              loc != null
                ? new window.kakao.maps.LatLng(loc.latitude, loc.longitude)
                : new window.kakao.maps.LatLng(DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng);
            map.setCenter(center);
          }
          setListSheetStores(getStoresForListRef.current());
          const middleOff = getListSheetMiddleOffset();
          listSheetPanelMaxOffsetRef.current = getListSheetMaxOffset();
          listSheetPanelOffsetRef.current = middleOff;
          setListSheetPanelOffset(middleOff);
        }
      });
    },
    [
      clearKakaoMarkers,
      searchPlaces,
      updateUserLocationMarker,
      userLocation,
      closeListSheet,
      getListSheetMaxOffset,
      getListSheetMiddleOffset,
      setListSheetStores,
      setListSheetPanelOffset,
    ],
  );

  // ---- Effects ----
  // userLocation 변경 시 ref 동기화 (kakao.maps.load 콜백 등 비동기에서 최신 값 사용)
  useEffect(() => {
    userLocationRef.current = userLocation ?? null;
  }, [userLocation]);

  // 카카오 스크립트 로드 후 지도 1회 생성. URL 검색·픽업 필터 시 미입점 마커 없음
  useEffect(() => {
    if (typeof window === "undefined") return;
    const ready = kakaoLoaded || (window.kakao && window.kakao.maps);
    if (!ready || mapInstanceRef.current) return;
    initializeMap(getInitialCenter(), Boolean(searchQuery || pickupFilter));
  }, [kakaoLoaded, userLocation, searchQuery, pickupFilter, getInitialCenter, initializeMap]);

  // 검색 모드가 아닐 때만: 현재위치 획득 시 지도 중심을 현재위치로 이동 (검색 후 덮어쓰기 방지)
  useEffect(() => {
    if (
      searchQuery ||
      !userLocation ||
      !mapInstanceRef.current ||
      usedUserLocationForCenterRef.current
    )
      return;
    const map = mapInstanceRef.current;
    if (map.panTo) {
      isCenteringFromClickRef.current = true;
      map.panTo(new window.kakao.maps.LatLng(userLocation.latitude, userLocation.longitude));
      if (
        searchStoresRef.current === null &&
        !searchQueryRef.current &&
        pickupFilterRef.current == null
      ) {
        searchPlaces(map.getCenter());
      }
    }
    usedUserLocationForCenterRef.current = true;
  }, [userLocation, searchQuery, pickupFilter, searchPlaces]);

  // 현재위치 변경 시 지도 위 현재위치 마커(점) 갱신
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    updateUserLocationMarker(userLocation ?? null);
  }, [userLocation, updateUserLocationMarker]);

  // 플랫폼 스토어 전체 조회 후 캐시. 지도 있으면 마커 그리기, 검색 모드가 아니면 미입점 검색
  useEffect(() => {
    const fetchAll = async () => {
      const list: StoreInfo[] = [];
      let page = 1;
      const limit = 1000;
      let hasNext = true;
      const filterParams: StoreListFilter = {};
      if (listFilter.sizes?.length) filterParams.sizes = listFilter.sizes;
      if (listFilter.minPrice != null) filterParams.minPrice = listFilter.minPrice;
      if (listFilter.maxPrice != null) filterParams.maxPrice = listFilter.maxPrice;
      if (listFilter.productCategoryTypes?.length)
        filterParams.productCategoryTypes = listFilter.productCategoryTypes;
      const pickupQ = mapPickupFilterToStoreListQuery(pickupFilter);
      while (hasNext) {
        const res = await storeApi.getList({
          page,
          limit,
          ...filterParams,
          ...(pickupQ ?? {}),
        });
        list.push(...res.data);
        hasNext = res.meta.hasNext;
        page += 1;
      }
      return filterStoresWithCoordinates(list);
    };
    fetchAll()
      .then((stores) => {
        platformStoresRef.current = stores;
        const map = mapInstanceRef.current;
        if (map) {
          drawPlatformStoreMarkers();
          if (searchStoresRef.current === null) searchPlaces(map.getCenter());
        }
        // 목록 패널이 열려 있을 때 필터 변경 시 목록 즉시 반영
        if (listSheetPanelOffsetRef.current > 0) {
          setListSheetStores(getStoresForList());
        }
      })
      .catch(() => {});
  }, [
    drawPlatformStoreMarkers,
    searchPlaces,
    listFilter,
    pickupFilter,
    getStoresForList,
    setListSheetStores,
  ]);

  // URL ?q= 검색: 스토어 검색 API 호출 후 마커·bounds·목록 패널 처리. 결과 0개여도 패널 열고 중심은 현재위치/강남구
  useEffect(() => {
    if (!searchQuery) {
      searchStoresRef.current = null;
      const map = mapInstanceRef.current;
      if (map) drawPlatformStoreMarkers();
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const filterParams: StoreListFilter = {};
        if (listFilter.sizes?.length) filterParams.sizes = listFilter.sizes;
        if (listFilter.minPrice != null) filterParams.minPrice = listFilter.minPrice;
        if (listFilter.maxPrice != null) filterParams.maxPrice = listFilter.maxPrice;
        if (listFilter.productCategoryTypes?.length)
          filterParams.productCategoryTypes = listFilter.productCategoryTypes;
        const pickupQ = mapPickupFilterToStoreListQuery(pickupFilter);
        const res = await storeApi.getList({
          search: searchQuery,
          page: 1,
          limit: 1000,
          ...filterParams,
          ...(pickupQ ?? {}),
        });
        const stores = filterStoresWithCoordinates(res.data ?? []);
        if (cancelled) return;
        searchStoresRef.current = stores;
        const map = mapInstanceRef.current;
        if (!map || !window.kakao?.maps) return;
        clearKakaoMarkers(); // 검색 모드 진입 시 기존 미입점 마커 제거
        drawPlatformStoreMarkers();
        if (stores.length > 0) {
          const bounds = new window.kakao.maps.LatLngBounds();
          stores.forEach((s) =>
            bounds.extend(new window.kakao.maps.LatLng(s.latitude, s.longitude)),
          );
          map.setBounds(bounds, MAP_BOUNDS_PADDING);
        } else {
          // 검색 결과 0개: 지도 중심만 현재위치 또는 강남구로
          const center = userLocation
            ? new window.kakao.maps.LatLng(userLocation.latitude, userLocation.longitude)
            : new window.kakao.maps.LatLng(DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng);
          map.setCenter(center);
        }
        setListSheetStores(getStoresForList());
        const middleOff = getListSheetMiddleOffset();
        listSheetPanelMaxOffsetRef.current = getListSheetMaxOffset();
        listSheetPanelOffsetRef.current = middleOff;
        setListSheetPanelOffset(middleOff);
      } catch {
        searchStoresRef.current = null;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    searchQuery,
    listFilter,
    pickupFilter,
    userLocation,
    clearKakaoMarkers,
    drawPlatformStoreMarkers,
    getListSheetMaxOffset,
    getListSheetMiddleOffset,
    getStoresForList,
    setListSheetStores,
    setListSheetPanelOffset,
  ]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    drawPlatformStoreMarkersRef.current();
    if (listSheetPanelOffsetRef.current > 0) {
      setListSheetStores(getStoresForList());
    }
    setSelectedStore((prev) => {
      if (!prev || !pickupFilter || !prev.businessCalendar) return prev;
      if (pickupFilter.kind === "fullday") {
        return isStoreOpenOnSeoulCalendarDay(prev.businessCalendar, pickupFilter.date)
          ? prev
          : null;
      }
      if (pickupFilter.kind === "morning") {
        return storeCalendarOverlapsMapPickupHalfDay(
          prev.businessCalendar,
          pickupFilter.date,
          "morning",
        )
          ? prev
          : null;
      }
      return storeCalendarOverlapsMapPickupHalfDay(
        prev.businessCalendar,
        pickupFilter.date,
        "afternoon",
      )
        ? prev
        : null;
    });
  }, [pickupFilter, getStoresForList, setListSheetStores]);

  // ---- Handlers ----
  /** 내 위치 버튼: 현재위치 재요청 후 다음 effect에서 지도 중심 이동 */
  const handleRefreshLocation = () => {
    usedUserLocationForCenterRef.current = false;
    refreshUserLocation();
  };

  const handleListSheetTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    listSheetHandlePointerDown(e.touches[0].clientY);
  };
  const handleListSheetTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    listSheetHandlePointerMove(e.touches[0].clientY);
  };
  const handleListSheetTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    listSheetHandlePointerUp();
  };
  const handleListSheetMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    listSheetHandlePointerDown(e.clientY);
    const onMove = (ev: MouseEvent) => listSheetHandlePointerMove(ev.clientY);
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      listSheetHandlePointerUp();
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  // ---- Render ----
  if (!kakaoJavascriptKey) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-sm text-gray-500">
        <p className="mb-2 font-semibold">카카오 지도 설정이 필요합니다.</p>
        <p className="text-center">
          <code className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">
            NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY
          </code>
          환경변수를 설정한 뒤 다시 시도해주세요.
        </p>
      </div>
    );
  }

  const kakaoSdkUrl = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoJavascriptKey}&libraries=services&autoload=false`;

  return (
    <div className="relative w-full h-screen">
      <Script src={kakaoSdkUrl} strategy="afterInteractive" onLoad={() => setKakaoLoaded(true)} />
      <div className="h-full">
        <div ref={mapContainerRef} className="w-full h-full" aria-label="주변 베이커리 지도" />
      </div>

      <MapTopSearchBar
        searchQuery={searchQuery}
        pickupFilter={pickupFilter}
        onCalendarClick={() => setPickupCalendarOpen(true)}
        onPickupClear={handlePickupClear}
      />

      <MapPickupDateBottomSheet
        isOpen={pickupCalendarOpen}
        onClose={() => setPickupCalendarOpen(false)}
        selectedFilter={pickupFilter}
        onConfirm={handlePickupConfirm}
        onClearFilter={handlePickupClear}
      />

      <button
        type="button"
        onClick={handleRefreshLocation}
        className="absolute right-[15px] bottom-32 z-10 flex h-10 w-10 items-center justify-center rounded-[26px] border border-[#EBEBEA] bg-white p-2.5"
        style={{ boxShadow: "0px 2px 10px 0px #0000000A" }}
        aria-label="내 위치로 이동"
      >
        <Icon name="currentLocation" width={20} height={20} className="text-blue-400" />
      </button>

      <button
        type="button"
        onClick={openListSheet}
        className="absolute left-1/2 -translate-x-1/2 z-10 flex items-center justify-center bg-white"
        style={{
          bottom: 110,
          borderRadius: 26,
          border: "1px solid var(--grayscale-gr-100, #EBEBEA)",
          padding: "8px 14px",
          boxShadow: "0px 2px 10px 0px #0000000A",
        }}
        aria-label="목록 보기"
      >
        <span className="inline-flex items-center justify-center gap-1 leading-none">
          <span
            className="inline-flex shrink-0 items-center justify-center text-gray-900"
            style={{ width: 16, height: 16 }}
          >
            <Icon name="list" width={16} height={16} className="block" />
          </span>
          <span
            className="text-gray-900 block"
            style={{ fontWeight: 400, fontSize: 14, lineHeight: 1.4, paddingTop: 1 }}
          >
            목록 보기
          </span>
        </span>
      </button>

      {selectedStore && (
        <div
          className="absolute z-30"
          style={{ left: 16, right: 16, bottom: MAP_SELECTED_STORE_CARD_BOTTOM }}
        >
          <MapStoreCard store={selectedStore} />
        </div>
      )}

      {!selectedStore && (
        <MapListSheetPanel
          offset={listSheetPanelOffset}
          expandedToTop={
            listSheetPanelOffset > 0 && listSheetPanelOffset >= getListSheetMaxOffset() - 1
          }
          isDragging={isListSheetPanelDragging}
          onTouchStart={handleListSheetTouchStart}
          onTouchMove={handleListSheetTouchMove}
          onTouchEnd={handleListSheetTouchEnd}
          onMouseDown={handleListSheetMouseDown}
          sheetPointerDown={listSheetHandlePointerDown}
          sheetPointerMove={listSheetHandlePointerMove}
          sheetPointerUp={listSheetHandlePointerUp}
        >
          {listSheetPanelOffset > 0 && (
            <MapStoreListSection
              stores={listSheetStores}
              hideHandle
              hideSortFilter={false}
              userLocation={userLocation}
              sortBy={listSortBy}
              onSortByChange={setListSortBy}
              listFilter={listFilter}
              onListFilterChange={setListFilter}
            />
          )}
        </MapListSheetPanel>
      )}

      <BottomNav />
    </div>
  );
}
