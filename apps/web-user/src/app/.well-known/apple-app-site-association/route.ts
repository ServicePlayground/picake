import { NextResponse } from "next/server";

import { getAppleAppSiteAssociation } from "@/apps/web-user/common/constants/ios-universal-links.constant";

/**
 * iOS Universal Links 검증용 apple-app-site-association(AASA).
 * @see https://developer.apple.com/documentation/xcode/supporting-universal-links-in-your-app
 */
export async function GET() {
  const association = getAppleAppSiteAssociation();

  return NextResponse.json(association, {
    headers: {
      // AASA는 확장자 없는 파일 + application/json + 리다이렉트 없음이 필수입니다.
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
