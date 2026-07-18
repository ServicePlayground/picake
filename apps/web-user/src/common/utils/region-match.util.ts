import { RegionData } from "@/apps/web-user/features/store/types/region.type";
import { REGION_COORDINATES } from "@/apps/web-user/common/constants/region-coordinates.constant";
import { calculateDistance } from "@/apps/web-user/common/utils/distance.util";

export interface RegionMatchResult {
  /** 표시용 문자열. 예) "광진구", "광진구 외 1곳", "서울 전지역" */
  label: string;
  storeCount: number;
  depth1Label: string;
  /**
   * 실제 선택된 depth2(구/군) label 목록.
   * 다중 선택 시 label은 "광진구 외 N곳"으로 뭉개지므로, 재진입 복원·필터 조합에는 이 배열을 사용한다.
   * 없으면(레거시 저장값·전지역) label 기반 로직으로 폴백.
   */
  selectedLabels?: string[];
}

/**
 * 역지오코딩 주소를 API regions와 매칭하여 결과를 반환합니다.
 */
export function matchAddressToRegion(
  address: string,
  regions: RegionData[],
): RegionMatchResult | null {
  if (!address) return null;

  for (const region of regions) {
    const depth1 = region.depth1;

    const depth1Matched = depth1.searchKeywords.some((keyword) => address.includes(keyword));

    if (!depth1Matched) continue;

    // depth2 매칭 시도 (전지역 제외)
    for (const depth2 of region.depth2) {
      if (depth2.label === "전지역") continue;

      const depth2Matched = depth2.searchKeywords.some((keyword) => address.includes(keyword));

      if (depth2Matched) {
        return {
          label: depth2.label,
          storeCount: depth2.storeCount,
          depth1Label: depth1.label,
          selectedLabels: [depth2.label],
        };
      }
    }

    // depth2 매칭 실패 시 depth1만
    return { label: depth1.label, storeCount: depth1.storeCount, depth1Label: depth1.label };
  }

  return null;
}

/**
 * 현재 지역이 비활성(storeCount === 0)일 때 사용자 위치에서 가장 가까운 활성 지역을 찾습니다.
 * GPS 좌표가 있으면 좌표 기반 거리 계산, 없으면 리스트 순서 기반 폴백.
 */
export function findNearestActiveRegion(
  regions: RegionData[],
  currentDepth1Label: string,
  userLat?: number | null,
  userLng?: number | null,
): RegionMatchResult | null {
  // 활성 depth2 후보 수집
  type Candidate = RegionMatchResult & { lat: number; lng: number };
  const candidates: Candidate[] = [];

  for (const region of regions) {
    if (region.depth1.label === "전국") continue;

    const depth1Coords = REGION_COORDINATES[region.depth1.label];

    for (const depth2 of region.depth2) {
      if (depth2.label === "전지역" || depth2.storeCount === 0) continue;

      const coords = depth1Coords?.[depth2.label];
      if (!coords) continue;

      candidates.push({
        label: depth2.label,
        storeCount: depth2.storeCount,
        depth1Label: region.depth1.label,
        lat: coords.lat,
        lng: coords.lng,
      });
    }

    // depth2 중 활성이 없으면 depth1 자체 확인
    if (
      region.depth1.storeCount > 0 &&
      candidates.every((c) => c.depth1Label !== region.depth1.label)
    ) {
      const depth1FirstCoords = depth1Coords ? Object.values(depth1Coords)[0] : null;
      if (depth1FirstCoords) {
        candidates.push({
          label: region.depth1.label,
          storeCount: region.depth1.storeCount,
          depth1Label: region.depth1.label,
          lat: depth1FirstCoords.lat,
          lng: depth1FirstCoords.lng,
        });
      }
    }
  }

  if (candidates.length === 0) return null;

  // GPS 좌표가 있으면 거리 기반으로 정렬
  if (userLat != null && userLng != null) {
    candidates.sort((a, b) => {
      const distA = calculateDistance(userLat, userLng, a.lat, a.lng);
      const distB = calculateDistance(userLat, userLng, b.lat, b.lng);
      return distA - distB;
    });
    const nearest = candidates[0];
    return {
      label: nearest.label,
      storeCount: nearest.storeCount,
      depth1Label: nearest.depth1Label,
    };
  }

  // GPS 없으면 같은 depth1 우선, 그 다음 리스트 순서
  const sameDep1 = candidates.find((c) => c.depth1Label === currentDepth1Label);
  if (sameDep1)
    return {
      label: sameDep1.label,
      storeCount: sameDep1.storeCount,
      depth1Label: sameDep1.depth1Label,
    };

  const first = candidates[0];
  return { label: first.label, storeCount: first.storeCount, depth1Label: first.depth1Label };
}

/**
 * RegionMatchResult를 API regions 파라미터 문자열로 변환합니다.
 * 예) "서울:강남구", "인천:강화군,인천:옹진군"
 */
export function buildRegionsParam(result: RegionMatchResult, regions: RegionData[]): string {
  const depth1Data = regions.find((r) => r.depth1.label === result.depth1Label);
  if (!depth1Data) return "";

  const depth1Keyword = depth1Data.depth1.searchKeywords[0];

  // depth1 전체(전지역) 선택 → 해당 지역 전체
  if (result.label === result.depth1Label || result.label === `${result.depth1Label} 전지역`) {
    return `${depth1Keyword}:전지역`;
  }

  // 실제 선택된 구 목록이 있으면 그걸로, 없으면(레거시) label 하나로 조합
  const targetLabels =
    result.selectedLabels && result.selectedLabels.length > 0
      ? result.selectedLabels
      : [result.label];

  // 각 선택 구의 searchKeyword마다 "시도:구" 쌍 생성 → "서울:광진구,서울:강남구"
  const pairs = targetLabels.flatMap((label) => {
    const depth2Data = depth1Data.depth2.find((d) => d.label === label);
    return depth2Data ? depth2Data.searchKeywords.map((kw) => `${depth1Keyword}:${kw}`) : [];
  });

  if (pairs.length === 0) return `${depth1Keyword}:전지역`;
  return pairs.join(",");
}
