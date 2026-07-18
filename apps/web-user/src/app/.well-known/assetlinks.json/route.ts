import { NextResponse } from "next/server";

import { getAndroidAssetLinks } from "@/apps/web-user/common/constants/android-asset-links.constant";

/**
 * Android App Links 검증용 Digital Asset Links.
 * @see https://developers.google.com/digital-asset-links/v1/getting-started
 */
export async function GET() {
  const statements = getAndroidAssetLinks();

  return NextResponse.json(statements, {
    headers: {
      // Digital Asset Links는 application/json + 리다이렉트 없음을 권장합니다.
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
