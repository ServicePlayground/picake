import { NODE_ENV, type NodeEnv } from "@/apps/web-user/common/constants/environment.constants";

/**
 * iOS Universal Links용 apple-app-site-association(AASA) 설정.
 *
 * - 검증: `https://staging.picakes.com/.well-known/apple-app-site-association`
 * - 상용: `https://picakes.com/.well-known/apple-app-site-association`
 * - 알림톡 WL 버튼(`https://#{도메인}/order/...`)이 앱으로 열리려면
 *   해당 도메인에 이 파일이 노출되고, iOS 앱에 Associated Domains(`applinks:`)
 *   capability와 도메인 등록이 되어 있어야 합니다.
 *   (Android의 assetlinks.json / intent-filter autoVerify와 대응하는 설정입니다.
 *   {@link ../../.well-known/assetlinks.json/route.ts})
 *
 * `appID`는 `{Apple Team ID}.{Bundle ID}` 형식입니다. Team ID(`S5AJRJ2DLR`)는
 * Sign in with Apple 설정 때 받은 것과 같은 Apple Developer 계정입니다.
 *
 * ⚠️ Bundle ID는 스테이징/프로덕션 구분 없이 `com.product.picake` 하나만 확인된 값입니다
 * (Android처럼 `.staging` 접미사로 분리된 별도 Bundle ID는 없음 — 앱담당자 확인 후 그대로 사용
 * 하기로 결정). 같은 Bundle ID를 쓰면 iOS 특성상 기기에 앱이 하나만 설치되므로, 그 기기에
 * 설치된 빌드가 무엇이든 staging/production 도메인 링크를 누르면 전부 그 앱으로 열립니다
 * (예: 스테이징 앱이 설치된 기기에서 프로덕션 알림톡 링크를 눌러도 스테이징 앱이 열림).
 */
export type AppleAppSiteAssociationDetail = {
  appIDs: string[];
  components: Array<{ "/": string; "?"?: Record<string, string>; comment?: string }>;
};

export type AppleAppSiteAssociation = {
  applinks: {
    details: AppleAppSiteAssociationDetail[];
  };
};

/**
 * 알림톡 WL 버튼 등에서 앱으로 열려야 하는 경로 패턴.
 * `USER_ORDER_ALIMTALK_BUTTON_URLS`(backend), `paths.constant.ts`(web-user) 기준.
 * 범위를 넓히거나 좁힐 때는 두 상수와 함께 맞춰주세요.
 */
const UNIVERSAL_LINK_COMPONENTS: AppleAppSiteAssociationDetail["components"] = [
  { "/": "/order/*", comment: "주문 상세/취소 (알림톡 [주문 상세보기], [입금 완료하기])" },
  {
    "/": "/mypage/reviews/write",
    "?": { orderId: "*" },
    comment: "리뷰 작성 (알림톡 [후기 작성하기])",
  },
  { "/": "/mypage/order", comment: "내 주문 목록" },
];

/** Team ID + Bundle ID — 환경 구분 없이 공용(위 주석 참고) */
const IOS_APP_ID = "S5AJRJ2DLR.com.product.picake";

/** 환경별 `{Team ID}.{Bundle ID}`. 비어 있으면 해당 환경 응답에서 제외됩니다. */
const IOS_APP_ID_BY_ENV: Record<typeof NODE_ENV.STAGING | typeof NODE_ENV.PRODUCTION, string> = {
  [NODE_ENV.STAGING]: IOS_APP_ID,
  [NODE_ENV.PRODUCTION]: IOS_APP_ID,
};

/** `NEXT_PUBLIC_NODE_ENV` 기준으로 노출할 apple-app-site-association을 반환합니다. */
export function getAppleAppSiteAssociation(nodeEnv?: string | null): AppleAppSiteAssociation {
  const env = (nodeEnv ?? process.env.NEXT_PUBLIC_NODE_ENV ?? "") as NodeEnv;
  const appId =
    env === NODE_ENV.PRODUCTION
      ? IOS_APP_ID_BY_ENV[NODE_ENV.PRODUCTION]
      : IOS_APP_ID_BY_ENV[NODE_ENV.STAGING];

  const details: AppleAppSiteAssociationDetail[] = appId
    ? [{ appIDs: [appId], components: UNIVERSAL_LINK_COMPONENTS }]
    : [];

  return { applinks: { details } };
}
