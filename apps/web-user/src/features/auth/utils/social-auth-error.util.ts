import { AxiosError } from "axios";
import type { SocialAuthFailReason } from "@/apps/web-user/common/types/analytics.type";

/** 소셜 로그인(kakaoLogin/googleLogin) 요청 실패의 fail_reason 판별 — 응답 없으면 네트워크 오류로 간주 */
export function resolveSocialAuthFailReason(error: unknown): SocialAuthFailReason {
  if (error instanceof AxiosError && !error.response) {
    return "network_error";
  }
  return "auth_error";
}
