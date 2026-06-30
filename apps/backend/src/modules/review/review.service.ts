import { Injectable } from "@nestjs/common";
import { ReviewListService } from "@apps/backend/modules/review/services/review-list.service";
import { ReviewDetailService } from "@apps/backend/modules/review/services/review-detail.service";
import { ReviewUserListService } from "@apps/backend/modules/review/services/review-user-list.service";
import { ReviewDeleteService } from "@apps/backend/modules/review/services/review-delete.service";
import { ReviewCreateService } from "@apps/backend/modules/review/services/review-create.service";
import { CreateMyReviewRequestDto } from "@apps/backend/modules/review/dto/review-create.dto";
import { ReviewResponseDto, MyReviewResponseDto } from "@apps/backend/modules/review/dto/review-detail.dto";
import { GetReviewsRequestDto } from "@apps/backend/modules/review/dto/review-list.dto";
import {
  GetMyReviewsRequestDto,
  MyReviewListResponseDto,
} from "@apps/backend/modules/review/dto/review-user-list.dto";
import { ReviewWritableListService } from "@apps/backend/modules/review/services/review-writable-list.service";
import {
  GetWritableReviewOrdersRequestDto,
  WritableReviewOrdersListResponseDto,
} from "@apps/backend/modules/review/dto/review-writable-list.dto";

/**
 * 후기 서비스
 *
 * 목록·상세·작성·삭제·마이페이지 전용 조회 등 후기 유스케이스를 하위 서비스에 위임합니다.
 */
@Injectable()
export class ReviewService {
  constructor(
    private readonly reviewListService: ReviewListService,
    private readonly reviewDetailService: ReviewDetailService,
    private readonly reviewUserListService: ReviewUserListService,
    private readonly reviewDeleteService: ReviewDeleteService,
    private readonly reviewCreateService: ReviewCreateService,
    private readonly reviewWritableListService: ReviewWritableListService,
  ) {}

  /**
   * 상품 후기 목록 조회 (사용자용)
   */
  async getProductReviewsForUser(productId: string, query: GetReviewsRequestDto) {
    return this.reviewListService.getProductReviewsForUser(productId, query);
  }

  /**
   * 상품 후기 단일 조회 (사용자용)
   */
  async getProductReviewForUser(productId: string, reviewId: string) {
    return this.reviewDetailService.getProductReviewForUser(productId, reviewId);
  }

  /**
   * 스토어 후기 목록 조회 (사용자용)
   */
  async getStoreReviewsForUser(storeId: string, query: GetReviewsRequestDto) {
    return this.reviewListService.getStoreReviewsForUser(storeId, query);
  }

  /**
   * 스토어 후기 단일 조회 (사용자용)
   */
  async getStoreReviewForUser(storeId: string, reviewId: string) {
    return this.reviewDetailService.getStoreReviewForUser(storeId, reviewId);
  }

  /**
   * 픽업 완료 주문 기준 후기 작성 (사용자용)
   */
  async createMyReviewForUser(
    userId: string,
    dto: CreateMyReviewRequestDto,
  ): Promise<MyReviewResponseDto> {
    return this.reviewCreateService.createMyReviewFromOrder(userId, dto);
  }

  /**
   * 내가 작성한 후기 목록 조회 (사용자용)
   */
  async getMyReviewsForUser(
    userId: string,
    query: GetMyReviewsRequestDto,
  ): Promise<MyReviewListResponseDto> {
    return this.reviewUserListService.getMyReviewsForUser(userId, query);
  }

  /**
   * 내가 작성한 후기 단건 조회 (사용자용·마이페이지)
   */
  async getMyReviewDetailForUser(userId: string, reviewId: string): Promise<MyReviewResponseDto> {
    return this.reviewDetailService.getMyReviewDetailForUser(userId, reviewId);
  }

  /**
   * 작성 가능한 후기 대상 주문 목록 (사용자용·마이페이지)
   */
  async getWritableReviewOrdersForUser(
    userId: string,
    query: GetWritableReviewOrdersRequestDto,
  ): Promise<WritableReviewOrdersListResponseDto> {
    return this.reviewWritableListService.getWritableOrdersForUser(userId, query);
  }

  /**
   * 내 후기 삭제 (사용자용)
   * 본인이 작성한 후기만 삭제할 수 있습니다.
   */
  async deleteMyReviewForUser(userId: string, reviewId: string) {
    return this.reviewDeleteService.deleteMyReviewForUser(userId, reviewId);
  }
}
