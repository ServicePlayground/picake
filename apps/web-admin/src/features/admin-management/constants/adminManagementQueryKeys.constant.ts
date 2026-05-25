import type { AdminAccountListQueryDto } from "@/apps/web-admin/features/admin-management/types/admin-management-account.dto";

/**
 * Admin Management 관련 쿼리 키 상수
 */
export const adminManagementQueryKeys = {
  all: ["admin-management"] as const,
  config: () => [...adminManagementQueryKeys.all, "config"] as const,
  requestLists: () => [...adminManagementQueryKeys.all, "requests", "list"] as const,
  requestList: (params: AdminAccountListQueryDto) =>
    [...adminManagementQueryKeys.requestLists(), params] as const,
  accountLists: () => [...adminManagementQueryKeys.all, "accounts", "list"] as const,
  accountList: (params: AdminAccountListQueryDto) =>
    [...adminManagementQueryKeys.accountLists(), params] as const,
} as const;
