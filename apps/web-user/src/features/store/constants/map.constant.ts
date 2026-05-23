import { REGION_COORDINATES } from "@/apps/web-user/common/constants/region-coordinates.constant";
import { ProductCategoryType } from "@/apps/web-user/features/product/types/product.type";

/** 지도 기본 중심 (현재위치 없을 때, 강남구) */
export const DEFAULT_MAP_CENTER = REGION_COORDINATES["서울"]?.["강남구"] ?? {
  lat: 37.5172,
  lng: 127.0473,
};

/** 목록 패널 핸들 높이(px) */
export const LIST_SHEET_HANDLE_HEIGHT = 32;

/** 하단 네비 영역 높이(px) - 패널이 채우는 최대 높이 계산용 */
export const LIST_SHEET_BOTTOM_NAV_HEIGHT = 60;

/** 지도 스토어 선택 카드 — 하단 네비 위 여백(px) */
export const MAP_STORE_CARD_BOTTOM_GAP = 28;

/** 스토어 선택 시 카드 bottom (목록 시트 핸들 숨김 상태) */
export const MAP_SELECTED_STORE_CARD_BOTTOM =
  LIST_SHEET_BOTTOM_NAV_HEIGHT + MAP_STORE_CARD_BOTTOM_GAP;

/** 목록 패널 중간단계: 화면 높이 대비 비율 (0.45 = 45vh) */
export const LIST_SHEET_OPEN_RATIO = 0.45;

/**
 * 목록 시트 스냅 높이 계산용 레이아웃 높이(px).
 * 웹뷰·모바일에서 innerHeight가 일시적으로 작게 잡히는 경우를 줄이기 위해
 * visualViewport와 innerHeight 중 큰 값을 사용합니다.
 */
export function getMapLayoutViewportHeight(): number {
  if (typeof window === "undefined") return 800;
  const inner = window.innerHeight;
  const visual = window.visualViewport?.height ?? 0;
  return Math.round(Math.max(inner, visual));
}

/** 시트 오픈 직전 레이아웃 높이 — 여러 프레임 샘플 중 최대값 (웹뷰 검색 진입 등) */
export function sampleMapLayoutViewportHeight(): Promise<number> {
  if (typeof window === "undefined") return Promise.resolve(800);

  return new Promise((resolve) => {
    const heights: number[] = [];
    const push = () => heights.push(getMapLayoutViewportHeight());

    push();
    requestAnimationFrame(() => {
      push();
      requestAnimationFrame(() => {
        push();
        resolve(Math.max(...heights, 400));
      });
    });
  });
}

/** 지도 bounds 패딩(px) - 검색 결과 전체가 보이도록 할 때 */
export const MAP_BOUNDS_PADDING = 80;

/** 지도 목록 필터 모달 루트 id (포털·시트 제스처 충돌 방지용) */
export const MAP_STORE_LIST_FILTER_MODAL_ID = "map-store-list-filter-modal";

/** 지도 마커 라벨(스토어명·미입점·영업 상태) 공통 흰색 외곽선 */
export const MAP_MARKER_LABEL_TEXT_SHADOW =
  "-1px 0px #fff, 0px 1px #fff, 1px 0px #fff, 0px -1px #fff";

/** 카카오 키워드 검색 시 사용하는 키워드 (미입점 마커) */
export const KAKAO_PLACES_KEYWORD = "주문제작 케이크";

/** 지도 목록 필터: 사이즈 옵션 (백엔드 CakeSizeDisplayName 표시명과 동일) */
export const MAP_LIST_SIZE_OPTIONS: string[] = ["도시락", "미니", "1호", "2호", "3호"];

/** 지도 목록 필터: 유형 옵션 (API ProductCategoryType 값, 라벨) */
export const MAP_LIST_CATEGORY_OPTIONS: { value: ProductCategoryType; label: string }[] = [
  { value: ProductCategoryType.BIRTHDAY, label: "생일" },
  { value: ProductCategoryType.LOVER, label: "연인" },
  { value: ProductCategoryType.FRIEND, label: "친구" },
  { value: ProductCategoryType.FAMILY, label: "가족" },
  { value: ProductCategoryType.ANNIVERSARY, label: "기념일" },
  { value: ProductCategoryType.SAME_DAY_PICKUP, label: "당일픽업" },
  { value: ProductCategoryType.LETTERING, label: "레터링" },
  { value: ProductCategoryType.CHARACTER, label: "캐릭터" },
  { value: ProductCategoryType.SIMPLE, label: "심플" },
  { value: ProductCategoryType.FLOWER, label: "꽃" },
  { value: ProductCategoryType.PHOTO, label: "사진" },
];
