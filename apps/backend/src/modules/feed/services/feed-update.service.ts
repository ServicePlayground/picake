import { Injectable } from "@nestjs/common";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import { UpdateFeedRequestDto } from "@apps/backend/modules/feed/dto/feed-update.dto";
import { JwtVerifiedPayload } from "@apps/backend/modules/auth/types/auth.types";
import { FeedOwnershipUtil } from "@apps/backend/modules/feed/utils/feed-ownership.util";
import { FeedSanitizeUtil } from "@apps/backend/modules/feed/utils/feed-sanitize.util";
import { LoggerUtil } from "@apps/backend/common/utils/logger.util";

/**
 * 피드 수정 서비스
 * 피드 수정 관련 로직을 담당합니다.
 */
@Injectable()
export class FeedUpdateService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 피드 수정 (판매자용)
   */
  async updateFeed(
    storeId: string,
    feedId: string,
    updateFeedDto: UpdateFeedRequestDto,
    user: JwtVerifiedPayload,
  ) {
    // 피드 소유권 확인
    await FeedOwnershipUtil.verifyFeedOwnership(
      this.prisma,
      feedId,
      user.sub,
      { sellerId: true },
      storeId,
    );

    try {
      const updatedFeed = await this.prisma.storeFeed.update({
        where: {
          id: feedId,
        },
        data: {
          title: updateFeedDto.title,
          content: FeedSanitizeUtil.sanitizeHtml(updateFeedDto.content),
          imageUrls: updateFeedDto.imageUrls ?? [],
        },
      });

      return {
        id: updatedFeed.id,
      };
    } catch (error: unknown) {
      LoggerUtil.log(
        `피드 수정 실패: 트랜잭션 에러 - userId: ${user.sub}, storeId: ${storeId}, feedId: ${feedId}, error: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}
