import type { TermsType } from "@/apps/web-seller/features/terms/types/terms.dto";

/**
 * Terms 관련 React Query 키
 */
export const termsQueryKeys = {
  all: ["terms"] as const,
  actives: () => [...termsQueryKeys.all, "active"] as const,
  active: (type: TermsType) => [...termsQueryKeys.actives(), type] as const,
  sellerActive: () => [...termsQueryKeys.all, "seller", "active"] as const,
} as const;
