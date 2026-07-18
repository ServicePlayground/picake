import type { HomeBannerImageAlign } from "@/apps/web-admin/features/home-banner/types/home-banner.dto";

/** 백엔드 HOME_BANNER_MAX_COUNT와 동일 */
export const HOME_BANNER_MAX_COUNT = 10;

/** 배너 이미지 정렬 기본값 */
export const HOME_BANNER_DEFAULT_ALIGN: HomeBannerImageAlign = "CENTER";

/** 배너 이미지 정렬 선택 옵션 (구매자 화면 폭이 좁을 때 잘리는 방향) */
export const HOME_BANNER_ALIGN_OPTIONS: ReadonlyArray<{
  value: HomeBannerImageAlign;
  label: string;
}> = [
  { value: "LEFT", label: "왼쪽 정렬 (오른쪽부터 잘림)" },
  { value: "CENTER", label: "가운데 정렬 (양쪽 균등)" },
  { value: "RIGHT", label: "오른쪽 정렬 (왼쪽부터 잘림)" },
];

/** 배너 이미지 업로드 허용 확장자 */
export const HOME_BANNER_UPLOAD_ACCEPT = ".jpg,.jpeg,.png,.webp";

/** 배너 이미지 업로드 최대 용량 (10MB) */
export const HOME_BANNER_UPLOAD_MAX_SIZE_BYTES = 10 * 1024 * 1024;

/** 배너 등록 폼 이미지 업로드 영역 크기 */
export const HOME_BANNER_UPLOAD_PREVIEW = {
  width: "100%",
  maxWidth: 560,
  height: 220,
} as const;
