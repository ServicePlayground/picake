import type { ListResponseDto } from "@/apps/web-admin/common/types/api.dto";

/**
 * 입점 요청 관리 DTO (백엔드 store-entry-request-admin.dto와 동일 구조)
 */

/** 입점 요청 처리 상태 */
export enum StoreEntryRequestStatus {
  REQUESTED = "REQUESTED",
  REVIEWING = "REVIEWING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  COMPLETED = "COMPLETED",
}

/** 입점 요청 목록 조회 쿼리 */
export interface StoreEntryRequestListQueryDto {
  page?: number;
  limit?: number;
  /** 장소명·주소·연락처·카테고리 */
  search?: string;
}

/** 요청자(구매자) 요약 */
export interface StoreEntryRequestConsumerDto {
  id: string;
  phone: string;
  name: string | null;
  nickname: string | null;
}

/** 입점 요청 목록·상세 항목 */
export interface StoreEntryRequestItemResponseDto {
  id: string;
  kakaoPlaceId: string;
  placeName: string;
  address: string | null;
  roadAddress: string | null;
  phone: string | null;
  categoryName: string | null;
  placeUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  status: StoreEntryRequestStatus;
  consumer: StoreEntryRequestConsumerDto;
  samePlaceRequestCount: number;
  createdAt: string;
  updatedAt: string;
}

/** 입점 요청 목록 응답 */
export type StoreEntryRequestListResponseDto = ListResponseDto<StoreEntryRequestItemResponseDto>;
