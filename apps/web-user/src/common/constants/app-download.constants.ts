/**
 * 앱 다운로드 진입점(`/app`)이 스토어 분기에 사용하는 링크 상수.
 *
 * 명함 등 **인쇄물에는 스토어 URL을 직접 넣지 않습니다.** 항상 `https://picakes.com/app`을
 * QR로 넣고, 어느 스토어로 보낼지는 서버가 User-Agent로 판단합니다
 * ({@link ../../app/app/route.ts}). 인쇄물은 회수할 수 없는데 스토어 구성은 바뀌므로
 * (지금은 App Store만, 이후 Play Store 추가) QR은 고정해두고 이 파일만 바꿔서 대응합니다.
 */

/** iOS App Store 링크 — 2026-08 입점 완료. */
export const APP_STORE_URL = "https://apps.apple.com/kr/app/picake/id6787681984";

/**
 * Play Store 입점 후 채울 링크. 비어 있는 동안 Android는 `/app/android` 안내 페이지로 갑니다.
 *
 * Android 패키지명은 `com.pickage.package`로 이미 확정돼 있으므로
 * ({@link ./android-asset-links.constant.ts}) 입점하면 최종 링크는 아래가 됩니다.
 * 이 값을 채우고 배포하면 그 즉시 Android도 스토어로 직행하고, 안내 페이지는 안 쓰이게 됩니다.
 *
 * `https://play.google.com/store/apps/details?id=com.pickage.package`
 */
const PLAY_STORE_URL_FALLBACK = "";

/**
 * 현재 유효한 Play Store 링크. 빈 문자열이면 아직 미입점 상태입니다.
 *
 * 배포 없이 먼저 켜보고 싶을 때를 위해 환경변수 `PLAY_STORE_URL`을 우선 봅니다
 * (`NEXT_PUBLIC_` 접두사가 없는 서버 전용 값 — 클라이언트에서 호출하면 항상 fallback을 씁니다).
 * 다만 Vercel은 환경변수를 바꿔도 재배포해야 반영되므로, 상시 운영값은
 * {@link PLAY_STORE_URL_FALLBACK}에 코드로 박아두는 쪽을 권장합니다.
 */
export function getPlayStoreUrl(): string {
  return (process.env.PLAY_STORE_URL || PLAY_STORE_URL_FALLBACK).trim();
}
