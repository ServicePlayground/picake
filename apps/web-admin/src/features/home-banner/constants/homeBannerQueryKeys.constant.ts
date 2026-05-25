/**
 * Home Banner 관련 쿼리 키 상수
 */
export const homeBannerQueryKeys = {
  all: ["home-banner"] as const,
  lists: () => [...homeBannerQueryKeys.all, "list"] as const,
  list: () => [...homeBannerQueryKeys.lists()] as const,
} as const;
