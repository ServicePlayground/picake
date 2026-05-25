/**
 * 홈 배너 API 타입 (백엔드 home-banner DTO와 정합)
 */
export interface HomeBannerItemResponseDto {
  id: string;
  imageUrl: string;
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
  linkUrl?: string;
  startsAt?: string;
  endsAt?: string;
  isActive?: boolean;
}

export interface UpdateHomeBannerRequestDto {
  imageUrl?: string;
  linkUrl?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive?: boolean;
}

export interface ReorderHomeBannerRequestDto {
  orderedIds: string[];
}
