import { NextResponse } from "next/server";
import { PATHS } from "@/apps/web-user/common/constants/paths.constant";

/**
 * Apple Return URL — Services ID에 등록된 값과 정확히 일치해야 하는 주소.
 *
 * `scope=email`을 요청하면 Apple은 `response_mode=form_post`를 강제해 인가 응답을 GET 쿼리가 아니라
 * 이 주소로 **POST**(x-www-form-urlencoded)합니다. 그래서 Google/Kakao처럼 클라이언트 페이지가 쿼리를
 * 읽는 방식이 안 되고, 여기(route handler)에서 폼바디를 먼저 파싱한 뒤 `code`만 쿼리로 붙여
 * 클라이언트 콜백 페이지(`/auth/login/apple/callback`)로 303 리다이렉트합니다 — 이후 흐름은
 * Google 콜백 페이지와 동일합니다.
 */
export async function POST(request: Request) {
  const formData = await request.formData();
  const code = formData.get("code");
  const error = formData.get("error");

  const callbackUrl = new URL(PATHS.AUTH.APPLE_CALLBACK, request.url);

  if (typeof code === "string" && code) {
    callbackUrl.searchParams.set("code", code);
  } else if (typeof error === "string" && error) {
    callbackUrl.searchParams.set("error", error);
  }

  return NextResponse.redirect(callbackUrl, { status: 303 });
}
