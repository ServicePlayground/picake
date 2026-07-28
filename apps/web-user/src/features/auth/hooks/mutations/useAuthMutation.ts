import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi } from "@/apps/web-user/features/auth/apis/auth.api";
import { useAuthStore } from "@/apps/web-user/common/store/auth.store";
import { useAlertStore } from "@/apps/web-user/common/store/alert.store";
import getApiMessage from "@/apps/web-user/common/utils/getApiMessage";
import type { PhoneVerificationPurpose } from "@/apps/web-user/features/auth/types/auth.dto";
import type { DuplicateAccountPayload } from "@/apps/web-user/features/auth/types/auth.dto";
import { parseDuplicateAccountPayload } from "@/apps/web-user/features/auth/utils/register-duplicate-account.util";
import { consumePostLoginRedirect } from "@/apps/web-user/features/auth/utils/post-login-redirect.util";

export function useSendPhoneVerification() {
  const { showAlert } = useAlertStore();

  return useMutation({
    mutationFn: ({ phone, purpose }: { phone: string; purpose: PhoneVerificationPurpose }) =>
      authApi.sendPhoneVerification(phone, purpose),
    onError: (error) => {
      showAlert({
        type: "error",
        title: "오류",
        message: getApiMessage.error(error),
      });
    },
  });
}

export function useVerifyPhoneCode() {
  const { showAlert } = useAlertStore();

  return useMutation({
    mutationFn: authApi.verifyPhoneCode,
    onError: (error) => {
      showAlert({
        type: "error",
        title: "오류",
        message: getApiMessage.error(error),
      });
    },
  });
}

export function useGoogleRegister(options?: {
  onDuplicateAccount?: (payload: DuplicateAccountPayload) => void;
}) {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const { showAlert } = useAlertStore();

  return useMutation({
    mutationFn: authApi.googleRegister,
    onSuccess: (data) => {
      login(data.accessToken);
      // 로그인을 시작했던 화면으로 복귀 (없으면 홈)
      router.replace(consumePostLoginRedirect());
    },
    onError: (error) => {
      const duplicate = parseDuplicateAccountPayload(error);
      if (duplicate) {
        options?.onDuplicateAccount?.(duplicate);
        return;
      }
      showAlert({
        type: "error",
        title: "오류",
        message: getApiMessage.error(error),
      });
    },
  });
}

export function useKakaoRegister(options?: {
  onDuplicateAccount?: (payload: DuplicateAccountPayload) => void;
}) {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const { showAlert } = useAlertStore();

  return useMutation({
    mutationFn: authApi.kakaoRegister,
    onSuccess: (data) => {
      login(data.accessToken);
      // 로그인을 시작했던 화면으로 복귀 (없으면 홈)
      router.replace(consumePostLoginRedirect());
    },
    onError: (error) => {
      const duplicate = parseDuplicateAccountPayload(error);
      if (duplicate) {
        options?.onDuplicateAccount?.(duplicate);
        return;
      }
      showAlert({
        type: "error",
        title: "오류",
        message: getApiMessage.error(error),
      });
    },
  });
}
