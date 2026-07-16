/**
 * 홈 배너 API 타입 (백엔드 home-banner DTO와 정합)
 */

/** 이미지 가로 정렬 (백엔드 Prisma enum `HomeBannerImageAlign`과 동기화) */
export type HomeBannerImageAlign = "LEFT" | "CENTER" | "RIGHT";

export interface HomeBannerItemResponseDto {
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

export interface HomeBannerListResponseDto {
  data: HomeBannerItemResponseDto[];
}

export interface CreateHomeBannerRequestDto {
  imageUrl: string;
  imageAlign?: HomeBannerImageAlign;
  linkUrl?: string;
  startsAt?: string;
  endsAt?: string;
  isActive?: boolean;
}

export interface UpdateHomeBannerRequestDto {
  imageUrl?: string;
  imageAlign?: HomeBannerImageAlign;
  linkUrl?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive?: boolean;
}

export interface ReorderHomeBannerRequestDto {
  orderedIds: string[];
}
