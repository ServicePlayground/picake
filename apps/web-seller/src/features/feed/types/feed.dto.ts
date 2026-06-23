/**
 * 피드 API 타입 (백엔드 feed DTO와 1:1 정합)
 * - 단일: FeedResponseDto
 * - 목록: FeedListResponseDto, 목록 요청은 PaginationRequest(page, limit)
 * - CRUD: CreateFeedRequestDto, CreateFeedResponseDto, UpdateFeedRequestDto, UpdateFeedResponseDto
 */

import type { ListResponseDto } from "@/apps/web-seller/common/types/api.dto";

export interface FeedResponseDto {
  id: string;
  storeId: string;
  title: string;
  content: string;
  imageUrls: string[];
  storeLogoImageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** 피드 목록 조회 요청 (page, limit만 사용) */
export interface FeedListRequestDto {
  page: number;
  limit: number;
}

export type FeedListResponseDto = ListResponseDto<FeedResponseDto>;

export interface CreateFeedRequestDto {
  storeId: string;
  title: string;
  content: string;
  imageUrls: string[];
}

export interface CreateFeedResponseDto {
  id: string;
}

export interface UpdateFeedRequestDto {
  title: string;
  content: string;
  imageUrls: string[];
}

export interface UpdateFeedResponseDto {
  id: string;
}
