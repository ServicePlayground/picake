import { Injectable } from "@nestjs/common";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import {
  GetMyReviewsRequestDto,
  MyReviewListResponseDto,
} from "@apps/backend/modules/review/dto/review-user-list.dto";
import { ReviewSortBy } from "@apps/backend/modules/review/constants/review.constants";
import { Prisma } from "@apps/backend/infra/database/prisma/generated/client";
import { calculatePaginationMeta } from "@apps/backend/common/utils/pagination.util";
import { ReviewMapperUtil } from "@apps/backend/modules/review/utils/review-mapper.util";
import { PRODUCT_REVIEW_ACTIVE_FILTER } from "@apps/backend/modules/review/constants/review-query.constant";

/**
 * 내가 작성한 후기 목록 조회 서비스
 * 사용자가 작성한 후기 목록 관련 비즈니스 로직을 처리합니다.
 */
@Injectable()
export class ReviewUserListService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 내가 작성한 후기 목록 조회 (사용자용)
   * 필터링, 정렬, 페이지네이션을 지원합니다.
   */
  async getMyReviewsForUser(
    userId: string,
    query: GetMyReviewsRequestDto,
  ): Promise<MyReviewListResponseDto> {
    const { page, limit, sortBy } = query;

    const where: Prisma.ProductReviewWhereInput = {
      consumerId: userId,
      ...PRODUCT_REVIEW_ACTIVE_FILTER,
    };

    const orderBy = this.getOrderBy(sortBy);

    const totalItems = await this.prisma.productReview.count({ where });

    const skip = (page - 1) * limit;

    const reviews = await this.prisma.productReview.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: ReviewMapperUtil.MY_REVIEW_INCLUDE,
    });

    const data = reviews.map((review) => ReviewMapperUtil.mapToMyReviewResponse(review));

    const meta = calculatePaginationMeta(page, limit, totalItems);

    return { data, meta };
  }

  /**
   * 정렬 조건 반환
   */
  private getOrderBy(sortBy: ReviewSortBy): Prisma.ProductReviewOrderByWithRelationInput[] {
    switch (sortBy) {
      case ReviewSortBy.RATING_DESC:
        return [{ rating: "desc" }, { createdAt: "desc" }];
      case ReviewSortBy.RATING_ASC:
        return [{ rating: "asc" }, { createdAt: "desc" }];
      case ReviewSortBy.LATEST:
      default:
        return [{ createdAt: "desc" }];
    }
  }
}
