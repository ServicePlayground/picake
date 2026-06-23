import { Injectable } from "@nestjs/common";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import { CreateFeedRequestDto } from "@apps/backend/modules/feed/dto/feed-create.dto";
import { FeedOwnershipUtil } from "@apps/backend/modules/feed/utils/feed-ownership.util";
import { FeedSanitizeUtil } from "@apps/backend/modules/feed/utils/feed-sanitize.util";
import { LoggerUtil } from "@apps/backend/common/utils/logger.util";

/**
 * 피드 생성 서비스
 * 피드 생성 관련 로직을 담당합니다.
 */
@Injectable()
export class FeedCreateService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 피드 생성 (판매자용)
   */
  async createFeed(userId: string, createFeedDto: CreateFeedRequestDto) {
    // 스토어 소유권 확인
    await FeedOwnershipUtil.verifyStoreOwnership(this.prisma, createFeedDto.storeId, userId);

    try {
      const feed = await this.prisma.storeFeed.create({
        data: {
          storeId: createFeedDto.storeId,
          title: createFeedDto.title,
          content: FeedSanitizeUtil.sanitizeHtml(createFeedDto.content),
          imageUrls: createFeedDto.imageUrls ?? [],
        },
      });

      return {
        id: feed.id,
      };
    } catch (error: unknown) {
      LoggerUtil.log(
        `피드 생성 실패: 트랜잭션 에러 - userId: ${userId}, storeId: ${createFeedDto.storeId}, error: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}
