/**
 * 홈 배너 React Query 키
 */
export const homeBannerQueryKeys = {
  all: ["home-banner"] as const,
  list: () => [...homeBannerQueryKeys.all, "list"] as const,
} as const;
