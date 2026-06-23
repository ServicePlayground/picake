/** 미입점 스토어(카카오 장소) 입점 요청 생성 요청 (백엔드 CreateStoreEntryRequestDto와 동일) */
export interface CreateStoreEntryRequest {
  kakaoPlaceId: string;
  placeName: string;
  address?: string;
  roadAddress?: string;
  phone?: string;
  categoryName?: string;
  placeUrl?: string;
  latitude?: number;
  longitude?: number;
}

/** 입점 요청 존재 여부 응답 (백엔드 StoreEntryRequestExistsResponseDto와 동일) */
export interface StoreEntryRequestExistsResponse {
  requested: boolean;
}
