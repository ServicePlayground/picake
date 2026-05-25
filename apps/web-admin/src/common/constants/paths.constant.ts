import { LoginPage } from "@/apps/web-admin/pages/auth/Login";
import { RegisterPage } from "@/apps/web-admin/pages/auth/Register";
import { TotpSetupPage } from "@/apps/web-admin/pages/auth/TotpSetup";
import { TotpVerifyPage } from "@/apps/web-admin/pages/auth/TotpVerify";
import { RootPage } from "@/apps/web-admin/pages/Root";
import { AdminRequestsListPage } from "@/apps/web-admin/pages/admin-management/requests/List";
import { AdminAccountsListPage } from "@/apps/web-admin/pages/admin-management/accounts/List";
import { AdminSettingsPage } from "@/apps/web-admin/pages/admin-management/settings/Index";

export const ROUTES = {
  ROOT: "/",
  // 인증 관련 경로
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    TOTP_SETUP: "/auth/totp/setup",
    TOTP_VERIFY: "/auth/totp/verify",
  },
  // 관리자 계정 관리
  ADMIN_MANAGEMENT: {
    REQUESTS: "/admin-management/requests",
    ACCOUNTS: "/admin-management/accounts",
    SETTINGS: "/admin-management/settings",
  },
} as const;

// 인증 관련 경로 (AdminLayout 밖)
export const AUTH_ROUTE_CONFIG = [
  { path: ROUTES.AUTH.LOGIN, element: LoginPage },
  { path: ROUTES.AUTH.REGISTER, element: RegisterPage },
  { path: ROUTES.AUTH.TOTP_VERIFY, element: TotpVerifyPage },
  { path: ROUTES.AUTH.TOTP_SETUP, element: TotpSetupPage },
] as const;

// 관리자 관련 경로 (AdminLayout 안)
export const ADMIN_ROUTE_CONFIG = [
  { path: ROUTES.ROOT, element: RootPage },
  // 관리자 계정 관리
  { path: ROUTES.ADMIN_MANAGEMENT.REQUESTS, element: AdminRequestsListPage },
  { path: ROUTES.ADMIN_MANAGEMENT.ACCOUNTS, element: AdminAccountsListPage },
  { path: ROUTES.ADMIN_MANAGEMENT.SETTINGS, element: AdminSettingsPage },
] as const;
