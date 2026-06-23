import { PaginationMeta } from "@/apps/web-user/common/types/api.type";

/**
 * 피드 정보
 */
export interface Feed {
  id: string;
  storeId: string;
  title: string;
  content: string; // 텍스트 형식
  imageUrls: string[];
  storeLogoImageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 피드 목록 조회 요청 파라미터
 */
export interface GetFeedsParams {
  storeId: string;
  page?: number;
  limit?: number;
}

/**
 * 피드 목록 응답
 */
export interface FeedListResponse {
  data: Feed[];
  meta: PaginationMeta;
}
