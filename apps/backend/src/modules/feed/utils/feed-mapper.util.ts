import { FeedResponseDto } from "@apps/backend/modules/feed/dto/feed-detail.dto";
import { Prisma } from "@apps/backend/infra/database/prisma/generated/client";

/**
 * 피드 매핑 유틸리티
 * Prisma StoreFeed 엔티티를 응답 DTO로 변환하는 공통 로직을 제공합니다.
 */
export class FeedMapperUtil {
  /**
   * Store logoImageUrl select 필드
   * 피드 조회 시 store의 logoImageUrl을 가져오기 위한 공통 select 필드
   */
  static readonly STORE_LOGO_IMAGE_URL_SELECT = {
    logoImageUrl: true,
  } as const satisfies Prisma.StoreSelect;
  /**
   * Prisma StoreFeed 엔티티를 FeedResponseDto로 변환
   * @param feed - Prisma StoreFeed 엔티티 (store 포함)
   * @returns FeedResponseDto 객체
   */
  static mapToFeedResponse(feed: {
    id: string;
    storeId: string;
    title: string;
    content: string;
    imageUrls: string[];
    createdAt: Date;
    updatedAt: Date;
    store: {
      logoImageUrl?: string | null;
    };
  }): FeedResponseDto {
    return {
      id: feed.id,
      storeId: feed.storeId,
      title: feed.title,
      content: feed.content,
      imageUrls: feed.imageUrls,
      storeLogoImageUrl: feed.store.logoImageUrl ?? null,
      createdAt: feed.createdAt,
      updatedAt: feed.updatedAt,
    };
  }
}
