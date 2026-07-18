import type { StoreManagementListQueryDto } from "@/apps/web-admin/features/store-management/types/store-management.dto";

/**
 * 스토어 관리 관련 쿼리 키 상수
 */
export const storeManagementQueryKeys = {
  all: ["store-management"] as const,
  stores: () => [...storeManagementQueryKeys.all, "stores"] as const,
  storeList: (params: StoreManagementListQueryDto) =>
    [...storeManagementQueryKeys.stores(), params] as const,
  storeDetail: (storeId: string) => [...storeManagementQueryKeys.stores(), storeId] as const,
} as const;
