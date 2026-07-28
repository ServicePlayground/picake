"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/apps/web-user/features/auth/apis/auth.api";
import { useAuthStore } from "@/apps/web-user/common/store/auth.store";
import { AUTH_ERROR_MESSAGES } from "@/apps/web-user/features/auth/constants/auth.constant";
import { PATHS } from "@/apps/web-user/common/constants/paths.constant";
import { useAlertStore } from "@/apps/web-user/common/store/alert.store";
import getApiMessage from "@/apps/web-user/common/utils/getApiMessage";
import {
  clearPostLoginRedirect,
  consumePostLoginRedirect,
} from "@/apps/web-user/features/auth/utils/post-login-redirect.util";

/**
 * 구글 OAuth 리다이렉트 콜백 — `code`로 `/v1/consumer/auth/google/login` 호출
 * 휴대폰 미연동 시 → `googleId`·`googleEmail`을 쿼리로 붙여 `/auth/register/google`으로 이동
 */
function GoogleAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const { showAlert } = useAlertStore();

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      clearPostLoginRedirect();
      router.replace(PATHS.HOME);
      return;
    }

    const run = async () => {
      try {
        const data = await authApi.googleLogin(code);
        login(data.accessToken);
        // 로그인을 시작했던 화면으로 복귀 (없으면 홈)
        router.replace(consumePostLoginRedirect());
      } catch (error: unknown) {
        const err = error as {
          response?: {
            data?: { data?: { googleId?: string; googleEmail?: string; message?: string } };
          };
        };
        const { googleId, googleEmail, message } = err?.response?.data?.data || {};

        if (
          message === AUTH_ERROR_MESSAGES.PHONE_VERIFICATION_REQUIRED &&
          googleId &&
          googleEmail
        ) {
          const params = new URLSearchParams();
          params.set("googleId", googleId);
          params.set("googleEmail", googleEmail);
          // 회원가입으로 이어지므로 복귀 경로는 유지 (가입 완료 후 사용)
          router.replace(`${PATHS.AUTH.GOOGLE_REGISTER}?${params.toString()}`);
        } else {
          clearPostLoginRedirect();
          router.replace(PATHS.HOME);
          showAlert({
            type: "error",
            title: "오류",
            message: getApiMessage.error(error),
          });
        }
      }
    };

    void run();
  }, [searchParams, router, login, showAlert]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-gray-50">
      <p className="text-sm text-gray-600">구글 로그인 처리 중...</p>
    </div>
  );
}

export default function GoogleAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
          <p className="text-sm text-gray-600">로딩 중...</p>
        </div>
      }
    >
      <GoogleAuthCallbackContent />
    </Suspense>
  );
}
