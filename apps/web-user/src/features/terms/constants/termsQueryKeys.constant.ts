import type { TermsType } from "@/apps/web-user/features/terms/types/terms.dto";

/**
 * Terms 관련 React Query 키
 */
export const termsQueryKeys = {
  all: ["terms"] as const,
  actives: () => [...termsQueryKeys.all, "active"] as const,
  active: (type: TermsType) => [...termsQueryKeys.actives(), type] as const,
  consumerActive: () => [...termsQueryKeys.all, "consumer", "active"] as const,
} as const;
