import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/apps/web-admin/features/auth/store/auth.store";
import { authApi } from "@/apps/web-admin/features/auth/apis/auth.api";
import { useAlertStore } from "@/apps/web-admin/common/store/alert.store";
import getApiMessage from "@/apps/web-admin/common/utils/getApiMessage";
import { ROUTES } from "@/apps/web-admin/common/constants/paths.constant";
import type {
  AdminAuthTotpSetupState,
  AdminAuthTotpVerifyState,
  AdminTotpEnableParams,
  AdminTotpSetupParams,
  AdminTotpVerifyLoginRequest,
} from "@/apps/web-admin/features/auth/types/auth.dto";

export function useLogout() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => Promise.resolve(),
    onSuccess: () => {
      logout(navigate);
    },
  });
}

export function useRegister() {
  const navigate = useNavigate();
  const { addAlert } = useAlertStore();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      addAlert({
        title: "성공",
        message: "회원가입이 완료되었습니다. 로그인해주세요.",
        severity: "success",
      });
      navigate(ROUTES.AUTH.LOGIN);
    },
    onError: (error) => {
      addAlert({
        title: "오류",
        message: getApiMessage.error(error),
        severity: "error",
      });
    },
  });
}

export function useSetupTotpMutation() {
  const { addAlert } = useAlertStore();

  const mutation = useMutation({
    mutationFn: (params: AdminTotpSetupParams) => authApi.setupTotp(params),
    onError: (error) => {
      addAlert({
        title: "오류",
        message: getApiMessage.error(error),
        severity: "error",
      });
    },
  });

  return mutation;
}

export function useEnableTotp() {
  const { addAlert } = useAlertStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (params: AdminTotpEnableParams) => {
      const { message } = await authApi.enableTotp(params);
      return { message, params };
    },
    onSuccess: ({ message }) => {
      addAlert({
        title: "성공",
        message: message ?? "Google OTP 2단계 인증이 활성화되었습니다.",
        severity: "success",
      });
      navigate(ROUTES.AUTH.LOGIN, { replace: true });
    },
    onError: (error) => {
      addAlert({
        title: "오류",
        message: getApiMessage.error(error),
        severity: "error",
      });
    },
  });
}

export function useVerifyTotpLogin() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { addAlert } = useAlertStore();

  return useMutation({
    mutationFn: (dto: AdminTotpVerifyLoginRequest) => authApi.verifyTotpLogin(dto),
    onSuccess: (data) => {
      login({ navigate, accessToken: data.accessToken });
    },
    onError: (error) => {
      addAlert({
        title: "오류",
        message: getApiMessage.error(error),
        severity: "error",
      });
    },
  });
}

export function useLogin() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { addAlert } = useAlertStore();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      if (data.requireTotpSetup && data.totpSetupPendingToken) {
        const state: AdminAuthTotpSetupState = {
          totpSetupPendingToken: data.totpSetupPendingToken,
        };
        navigate(ROUTES.AUTH.TOTP_SETUP, { state });
        return;
      }
      if (data.requireTotp && data.totpPendingToken) {
        const state: AdminAuthTotpVerifyState = { totpPendingToken: data.totpPendingToken };
        navigate(ROUTES.AUTH.TOTP_VERIFY, { state });
        return;
      }
      if (data.accessToken) {
        login({ navigate, accessToken: data.accessToken });
      }
    },
    onError: (error) => {
      addAlert({
        title: "오류",
        message: getApiMessage.error(error),
        severity: "error",
      });
    },
  });
}
