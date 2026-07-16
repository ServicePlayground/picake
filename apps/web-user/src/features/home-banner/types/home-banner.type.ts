/**
 * 홈 배너 API 타입 (백엔드 consumer home-banner DTO와 정합)
 */
/** 이미지 가로 정렬 (백엔드 Prisma enum `HomeBannerImageAlign`과 동기화) */
export type HomeBannerImageAlign = "LEFT" | "CENTER" | "RIGHT";

export interface HomeBanner {
  id: string;
  imageUrl: string;
  imageAlign: HomeBannerImageAlign;
  linkUrl: string | null;
  startsAt: string | null;
  endsAt: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** 홈 배너 목록 응답 */
export interface HomeBannerListResponse {
  data: HomeBanner[];
}
