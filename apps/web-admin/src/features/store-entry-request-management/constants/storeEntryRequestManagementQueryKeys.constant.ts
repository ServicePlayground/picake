import type { StoreEntryRequestListQueryDto } from "@/apps/web-admin/features/store-entry-request-management/types/store-entry-request-management.dto";

/**
 * 입점 요청 관리 관련 쿼리 키 상수
 */
export const storeEntryRequestManagementQueryKeys = {
  all: ["store-entry-request-management"] as const,
  requests: () => [...storeEntryRequestManagementQueryKeys.all, "requests"] as const,
  requestList: (params: StoreEntryRequestListQueryDto) =>
    [...storeEntryRequestManagementQueryKeys.requests(), params] as const,
  requestDetail: (requestId: string) =>
    [...storeEntryRequestManagementQueryKeys.requests(), requestId] as const,
} as const;
