/**
 * 입점 안내 페이지(`/partner`)가 연결하는 외부 링크 상수.
 *
 * 오프라인에서 만나는 사장님께 보여줄 QR에는 **이 링크들을 직접 넣지 않습니다.**
 * 항상 `https://picakes.com/partner`를 QR로 넣고, 실제 목적지는 이 파일에서 정합니다.
 * 인쇄물·명함의 QR은 회수할 수 없는데 설문 폼 주소나 운영 도메인은 바뀔 수 있기 때문입니다
 * (앱 다운로드 진입점 `/app`과 같은 원칙 — {@link ./app-download.constants.ts}).
 */

/** 판매자 운영 페이지 (web-seller 상용 도메인) */
export const SELLER_CONSOLE_URL = "https://seller.picakes.com";

/** 입점 사전 수요조사 Google Form */
export const PARTNER_SURVEY_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdCIclkHiXDHwxG0uhtSRUE1cKoxIzEA-xmuumlu7FWWGjTOA/viewform";
