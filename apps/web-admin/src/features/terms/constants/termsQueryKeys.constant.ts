import type { TermsType } from "@/apps/web-admin/features/terms/types/terms.dto";

/**
 * Terms 관련 쿼리 키 상수
 */
export const termsQueryKeys = {
  all: ["terms"] as const,
  activeLists: () => [...termsQueryKeys.all, "active"] as const,
  activeList: () => [...termsQueryKeys.activeLists()] as const,
  versionLists: () => [...termsQueryKeys.all, "versions", "list"] as const,
  versionList: (type: TermsType) => [...termsQueryKeys.versionLists(), type] as const,
  details: () => [...termsQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...termsQueryKeys.details(), id] as const,
} as const;
