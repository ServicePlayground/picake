import { adminClient } from "@/apps/web-admin/common/config/axios.config";
import type {
  AdminAuthMeResponse,
  AdminLoginRequest,
  AdminLoginResponse,
  AdminRegisterRequest,
  AdminRegisterResponse,
  AdminTokenResponse,
  AdminTotpEnableParams,
  AdminTotpEnableResponse,
  AdminTotpSetupParams,
  AdminTotpSetupResponse,
  AdminTotpVerifyLoginRequest,
} from "@/apps/web-admin/features/auth/types/auth.dto";

/**
 * 인증 관련 API 함수들
 */
export const authApi = {
  me: async (): Promise<AdminAuthMeResponse> => {
    const response = await adminClient.get<{ data: AdminAuthMeResponse }>("/auth/me");
    return response.data.data;
  },

  register: async (dto: AdminRegisterRequest): Promise<AdminRegisterResponse> => {
    const response = await adminClient.post<{ data: AdminRegisterResponse }>("/auth/register", dto);
    return response.data.data;
  },

  login: async (dto: AdminLoginRequest): Promise<AdminLoginResponse> => {
    const response = await adminClient.post<{ data: AdminLoginResponse }>("/auth/login", dto);
    return response.data.data;
  },

  setupTotp: async (params: AdminTotpSetupParams): Promise<AdminTotpSetupResponse> => {
    const { totpSetupPendingToken } = params;
    const response = await adminClient.post<{ data: AdminTotpSetupResponse }>(
      "/auth/totp/setup",
      undefined,
      { headers: { Authorization: `Bearer ${totpSetupPendingToken}` } },
    );
    return response.data.data;
  },

  enableTotp: async (params: AdminTotpEnableParams): Promise<AdminTotpEnableResponse> => {
    const { totpSetupPendingToken, totpCode } = params;
    const response = await adminClient.post<{ data: AdminTotpEnableResponse }>(
      "/auth/totp/enable",
      { totpCode },
      { headers: { Authorization: `Bearer ${totpSetupPendingToken}` } },
    );
    return response.data.data;
  },

  verifyTotpLogin: async (dto: AdminTotpVerifyLoginRequest): Promise<AdminTokenResponse> => {
    const response = await adminClient.post<{ data: AdminTokenResponse }>(
      "/auth/login/totp-verify",
      dto,
    );
    return response.data.data;
  },
};
