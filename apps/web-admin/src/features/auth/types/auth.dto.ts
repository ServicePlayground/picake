export interface AdminRegisterRequest {
  username: string;
  password: string;
}

export interface AdminRegisterResponse {
  id: string;
  username: string;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  requiresApproval: boolean;
  createdAt: string;
}

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface AdminLoginResponse {
  requireTotpSetup?: boolean;
  totpSetupPendingToken?: string;
  requireTotp?: boolean;
  totpPendingToken?: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface AdminAuthMeResponse {
  available: boolean;
}

export interface AdminTotpVerifyLoginRequest {
  totpPendingToken: string;
  totpCode: string;
}

export interface AdminTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface AdminTotpSetupResponse {
  secret: string;
  otpauthUrl: string;
}

export interface AdminTotpSetupParams {
  totpSetupPendingToken: string;
}

export interface AdminTotpEnableRequest {
  totpCode: string;
}

export interface AdminTotpEnableParams extends AdminTotpEnableRequest {
  totpSetupPendingToken: string;
}

export interface AdminTotpEnableResponse {
  message: string;
}

export type AdminAuthTotpSetupState = {
  totpSetupPendingToken?: string;
};

export type AdminAuthTotpVerifyState = {
  totpPendingToken?: string;
};
