/** 사용자가 확정한 지역을 저장하는 localStorage 키 */
export const REGION_STORAGE_KEY = "picake:selected-region";

/**
 * localStorage에 확정된 지역이 저장돼 있는지 확인합니다.
 *
 * 홈 진입 시 "Header가 지역을 복원할 때까지 상품 목록 요청을 기다려야 하는지"를
 * 판단하는 용도입니다. 지역 스토어에는 persist가 없어 첫 렌더에는 항상 null이므로,
 * 저장된 지역의 존재 여부는 localStorage로만 알 수 있습니다.
 *
 * SSR·스토리지 차단 환경에서는 false를 반환합니다(지역 필터 없이 즉시 조회).
 */
export function hasStoredRegion(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return !!window.localStorage.getItem(REGION_STORAGE_KEY);
  } catch {
    return false;
  }
}
