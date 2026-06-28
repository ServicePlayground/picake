import type { StoreListFilter } from "@/apps/web-user/features/store/types/store.type";

export const storeQueryKeys = {
  all: ["store"] as const,
  detail: (storeId: string) => ["store", "detail", storeId] as const,
  list: (params: { search?: string; sortBy?: string } & StoreListFilter) =>
    ["store", "list", params] as const,
  entryRequestExists: (kakaoPlaceId: string) =>
    ["store", "entry-request", "exists", kakaoPlaceId] as const,
} as const;
