import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import {
  ORDER_ERROR_MESSAGES,
  OrderStatus,
} from "@apps/backend/modules/order/constants/order.constants";
import { REVIEW_ERROR_MESSAGES } from "@apps/backend/modules/review/constants/review.constants";
import { CreateMyReviewRequestDto } from "@apps/backend/modules/review/dto/review-create.dto";
import { MyReviewResponseDto } from "@apps/backend/modules/review/dto/review-detail.dto";
import { ReviewMapperUtil } from "@apps/backend/modules/review/utils/review-mapper.util";
import { LoggerUtil } from "@apps/backend/common/utils/logger.util";

/**
 * 후기 작성 서비스 (사용자·마이페이지)
 */
@Injectable()
export class ReviewCreateService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 픽업 완료 주문에 대해 후기를 작성합니다.
   * 주문당 1회만 작성 가능합니다.
   */
  async createMyReviewFromOrder(
    userId: string,
    dto: CreateMyReviewRequestDto,
  ): Promise<MyReviewResponseDto> {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      select: {
        id: true,
        consumerId: true,
        productId: true,
        orderStatus: true,
      },
    });

    if (!order) {
      LoggerUtil.log(`후기 작성 실패: 주문 없음 - userId: ${userId}, orderId: ${dto.orderId}`);
      throw new NotFoundException(ORDER_ERROR_MESSAGES.NOT_FOUND);
    }

    if (order.consumerId !== userId) {
      LoggerUtil.log(`후기 작성 실패: 주문 권한 없음 - userId: ${userId}, orderId: ${dto.orderId}`);
      throw new ForbiddenException(ORDER_ERROR_MESSAGES.FORBIDDEN);
    }

    if (order.orderStatus !== OrderStatus.PICKUP_COMPLETED) {
      LoggerUtil.log(
        `후기 작성 실패: 주문 상태 불가 - userId: ${userId}, orderId: ${dto.orderId}, status: ${order.orderStatus}`,
      );
      throw new BadRequestException(REVIEW_ERROR_MESSAGES.REVIEW_ORDER_NOT_ELIGIBLE);
    }

    const existingForOrder = await this.prisma.productReview.findUnique({
      where: { orderId: order.id },
      select: { id: true, deletedAt: true },
    });

    if (existingForOrder) {
      if (existingForOrder.deletedAt == null) {
        LoggerUtil.log(`후기 작성 실패: 이미 작성됨 - userId: ${userId}, orderId: ${dto.orderId}`);
        throw new ConflictException(REVIEW_ERROR_MESSAGES.REVIEW_ALREADY_WRITTEN);
      }
      LoggerUtil.log(
        `후기 작성 실패: 삭제 후 재작성 불가 - userId: ${userId}, orderId: ${dto.orderId}`,
      );
      throw new BadRequestException(REVIEW_ERROR_MESSAGES.REVIEW_REVOKED_CANNOT_REWRITE);
    }

    const review = await this.prisma.productReview.create({
      data: {
        consumerId: userId,
        productId: order.productId,
        orderId: order.id,
        rating: dto.rating,
        content: dto.content,
        imageUrls: dto.imageUrls ?? [],
      },
      include: ReviewMapperUtil.MY_REVIEW_INCLUDE,
    });

    return ReviewMapperUtil.mapToMyReviewResponse(review);
  }
}
