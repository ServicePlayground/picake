/** 백엔드 HOME_BANNER_MAX_COUNT와 동일 */
export const HOME_BANNER_MAX_COUNT = 10;

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
