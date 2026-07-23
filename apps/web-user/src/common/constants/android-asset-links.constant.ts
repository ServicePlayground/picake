import { NODE_ENV, type NodeEnv } from "@/apps/web-user/common/constants/environment.constants";

/**
 * Android App Links용 Digital Asset Links 설정.
 *
 * - 검증: `https://staging.picakes.com/.well-known/assetlinks.json`
 * - 상용: `https://picakes.com/.well-known/assetlinks.json`
 * - 알림톡 WL 버튼(`https://#{도메인}/order/...`)이 앱으로 열리려면
 *   해당 도메인에 이 파일이 노출되고, Android 앱의 intent-filter에 autoVerify가 있어야 합니다.
 *
 * `sha256_cert_fingerprints`는 Play App Signing 사용 시 Play Console의
 * App signing key certificate SHA-256을 넣습니다. (로컬 keystore와 다를 수 있음)
 */
export type AndroidAssetLinkStatement = {
  relation: ["delegate_permission/common.handle_all_urls"];
  target: {
    namespace: "android_app";
    package_name: string;
    sha256_cert_fingerprints: string[];
  };
};

/** 환경별 Android 패키지·서명 지문. 지문이 비어 있으면 해당 환경 응답에서 제외됩니다. */
export const ANDROID_ASSET_LINKS_BY_ENV: Record<
  typeof NODE_ENV.STAGING | typeof NODE_ENV.PRODUCTION,
  AndroidAssetLinkStatement[]
> = {
  [NODE_ENV.STAGING]: [
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: "com.pickage.package.staging",
        sha256_cert_fingerprints: [
          "26:C8:BC:50:8C:09:90:78:4B:0B:0F:2B:C1:5C:6C:A6:45:9E:41:91:36:74:19:CA:42:DF:F5:FC:20:AC:0E:CB",
        ],
      },
    },
  ],
  [NODE_ENV.PRODUCTION]: [
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: "com.pickage.package",
        sha256_cert_fingerprints: [
          "B8:35:F0:0F:3F:4D:19:89:15:31:5D:E9:A0:02:30:D4:BD:F8:8D:EF:6B:40:7C:4C:16:AC:FB:1B:F4:9F:2F:8F",
        ],
      },
    },
  ],
};

/** `NEXT_PUBLIC_NODE_ENV` 기준으로 노출할 assetlinks 목록을 반환합니다. */
export function getAndroidAssetLinks(nodeEnv?: string | null): AndroidAssetLinkStatement[] {
  const env = (nodeEnv ?? process.env.NEXT_PUBLIC_NODE_ENV ?? "") as NodeEnv;
  const statements =
    env === NODE_ENV.PRODUCTION
      ? ANDROID_ASSET_LINKS_BY_ENV[NODE_ENV.PRODUCTION]
      : ANDROID_ASSET_LINKS_BY_ENV[NODE_ENV.STAGING];

  return statements.filter((statement) => statement.target.sha256_cert_fingerprints.length > 0);
}
