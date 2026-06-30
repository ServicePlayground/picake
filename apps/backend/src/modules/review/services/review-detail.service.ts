import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import { REVIEW_ERROR_MESSAGES } from "@apps/backend/modules/review/constants/review.constants";
import { STORE_ERROR_MESSAGES } from "@apps/backend/modules/store/constants/store.constants";
import { PRODUCT_ERROR_MESSAGES } from "@apps/backend/modules/product/constants/product.constants";
import { ReviewMapperUtil } from "@apps/backend/modules/review/utils/review-mapper.util";
import { LoggerUtil } from "@apps/backend/common/utils/logger.util";
import { PRODUCT_REVIEW_ACTIVE_FILTER } from "@apps/backend/modules/review/constants/review-query.constant";
import { MyReviewResponseDto } from "@apps/backend/modules/review/dto/review-detail.dto";

/**
 * 후기 단일 조회 서비스
 * 상품 및 스토어 후기 단건 조회 관련 비즈니스 로직을 처리합니다.
 */
@Injectable()
export class ReviewDetailService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 상품 후기 단일 조회 (사용자용)
   */
  async getProductReviewForUser(productId: string, reviewId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      LoggerUtil.log(
        `후기 상세 조회 실패: 상품 없음 - productId: ${productId}, reviewId: ${reviewId}`,
      );
      throw new NotFoundException(PRODUCT_ERROR_MESSAGES.NOT_FOUND);
    }

    const review = await this.prisma.productReview.findFirst({
      where: {
        id: reviewId,
        productId,
        ...PRODUCT_REVIEW_ACTIVE_FILTER,
      },
      include: {
        consumer: {
          select: ReviewMapperUtil.USER_INFO_SELECT,
        },
        ...ReviewMapperUtil.PRODUCT_STORE_INCLUDE,
        ...ReviewMapperUtil.REVIEW_ORDER_INCLUDE,
      },
    });

    if (!review) {
      LoggerUtil.log(
        `후기 상세 조회 실패: 후기 없음 - productId: ${productId}, reviewId: ${reviewId}`,
      );
      throw new NotFoundException(REVIEW_ERROR_MESSAGES.REVIEW_NOT_FOUND);
    }

    return ReviewMapperUtil.mapToReviewResponse(review);
  }

  /**
   * 내가 작성한 후기 단건 조회 (마이페이지)
   * 본인 소유이며 소프트 삭제되지 않은 후기만 반환합니다.
   */
  async getMyReviewDetailForUser(userId: string, reviewId: string): Promise<MyReviewResponseDto> {
    const review = await this.prisma.productReview.findFirst({
      where: {
        id: reviewId,
        consumerId: userId,
        ...PRODUCT_REVIEW_ACTIVE_FILTER,
      },
      include: ReviewMapperUtil.MY_REVIEW_INCLUDE,
    });

    if (!review) {
      LoggerUtil.log(
        `내 후기 상세 조회 실패: 후기 없음 또는 권한 없음 - userId: ${userId}, reviewId: ${reviewId}`,
      );
      throw new NotFoundException(REVIEW_ERROR_MESSAGES.REVIEW_NOT_FOUND);
    }

    return ReviewMapperUtil.mapToMyReviewResponse(review);
  }

  /**
   * 스토어 후기 단일 조회 (사용자용)
   * 해당 스토어의 상품 중 하나에 대한 후기를 조회합니다.
   */
  async getStoreReviewForUser(storeId: string, reviewId: string) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      select: { id: true },
    });

    if (!store) {
      LoggerUtil.log(
        `후기 상세 조회 실패: 스토어 없음 - storeId: ${storeId}, reviewId: ${reviewId}`,
      );
      throw new NotFoundException(STORE_ERROR_MESSAGES.NOT_FOUND);
    }

    const review = await this.prisma.productReview.findFirst({
      where: {
        id: reviewId,
        product: {
          storeId,
        },
        ...PRODUCT_REVIEW_ACTIVE_FILTER,
      },
      include: {
        consumer: {
          select: ReviewMapperUtil.USER_INFO_SELECT,
        },
        ...ReviewMapperUtil.PRODUCT_STORE_INCLUDE,
        ...ReviewMapperUtil.REVIEW_ORDER_INCLUDE,
      },
    });

    if (!review) {
      LoggerUtil.log(`후기 상세 조회 실패: 후기 없음 - storeId: ${storeId}, reviewId: ${reviewId}`);
      throw new NotFoundException(REVIEW_ERROR_MESSAGES.REVIEW_NOT_FOUND);
    }

    return ReviewMapperUtil.mapToReviewResponse(review);
  }
}
