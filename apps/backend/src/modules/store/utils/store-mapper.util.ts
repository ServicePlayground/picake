import { Store } from "@apps/backend/infra/database/prisma/generated/client";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import { StoreResponseDto } from "@apps/backend/modules/store/dto/store-detail.dto";
import { Prisma } from "@apps/backend/infra/database/prisma/generated/client";
import { LoggerUtil } from "@apps/backend/common/utils/logger.util";
import { EnableStatus } from "@apps/backend/modules/product/constants/product.constants";
import {
  businessCalendarStateFromStoreRow,
  toStoreBusinessCalendarApiShape,
} from "@apps/backend/modules/store/utils/store-business-calendar.util";
import { refundCancellationPolicyFromDb } from "@apps/backend/modules/store/utils/store-refund-cancellation-policy.util";

/**
 * 스토어 매핑 유틸리티
 * Prisma Store 엔티티를 응답 DTO로 변환하는 공통 로직을 제공합니다.
 */
export class StoreMapperUtil {
  private static readonly context = StoreMapperUtil.name;
  /**
   * Product ID, StoreId, images, salePrice, visibilityStatus, salesStatus select 필드
   * 상품 ID, 스토어 ID, 대표이미지(images[0]), 최소금액 계산용
   */
  static readonly PRODUCT_ID_WITH_STORE_ID_SELECT = {
    id: true,
    storeId: true,
    images: true,
    salePrice: true,
    visibilityStatus: true,
    salesStatus: true,
  } as const satisfies Prisma.ProductSelect;

  /**
   * Review rating과 productId select 필드
   * 후기 rating과 productId를 함께 조회할 때 사용
   */
  static readonly REVIEW_RATING_WITH_PRODUCT_ID_SELECT = {
    productId: true,
    rating: true,
  } as const satisfies Prisma.ProductReviewSelect;

  /**
   * Prisma Store 엔티티를 StoreResponseDto로 변환
   * 단일 스토어 또는 여러 스토어를 처리합니다. N+1 쿼리 문제를 방지하기 위해 배치로 처리합니다.
   * @param stores - Prisma Store 엔티티 또는 배열
   * @param prisma - PrismaService 인스턴스 (후기 통계 계산용)
   * @returns StoreResponseDto 또는 배열
   */
  static async mapToStoreResponse(
    stores: Store | Store[],
    prisma: PrismaService,
  ): Promise<StoreResponseDto | StoreResponseDto[]> {
    const storesArray = Array.isArray(stores) ? stores : [stores];
    const isSingle = !Array.isArray(stores);

    if (storesArray.length === 0) {
      if (isSingle) {
        LoggerUtil.log("스토어 매핑 실패: 단일 스토어 매핑 대상이 비어 있습니다.");
        throw new Error("단일 스토어 매핑 대상이 비어 있습니다.");
      }
      return [];
    }

    const storeIds = storesArray.map((store) => store.id);

    // 모든 스토어의 상품들을 한 번에 조회
    const allProducts = await prisma.product.findMany({
      where: {
        storeId: {
          in: storeIds,
        },
      },
      select: StoreMapperUtil.PRODUCT_ID_WITH_STORE_ID_SELECT,
    });

    // 스토어별 상품 ID 그룹화 + 상품별 대표이미지(images[0]) + 스토어별 최소금액
    const productsByStoreId = new Map<string, string[]>();
    const productRepresentativeImage = new Map<string, string>();
    const storeSaleablePrices = new Map<string, number[]>();
    for (const product of allProducts) {
      if (!productsByStoreId.has(product.storeId)) {
        productsByStoreId.set(product.storeId, []);
      }
      productsByStoreId.get(product.storeId)!.push(product.id);
      const firstImage = product.images?.[0];
      if (firstImage) {
        productRepresentativeImage.set(product.id, firstImage);
      }
      if (
        product.visibilityStatus === EnableStatus.ENABLE &&
        product.salesStatus === EnableStatus.ENABLE
      ) {
        if (!storeSaleablePrices.has(product.storeId)) {
          storeSaleablePrices.set(product.storeId, []);
        }
        storeSaleablePrices.get(product.storeId)!.push(product.salePrice);
      }
    }

    // 모든 상품 ID 수집
    const allProductIds = allProducts.map((product) => product.id);

    // 모든 후기를 한 번에 조회
    const allReviews = await prisma.productReview.findMany({
      where: {
        productId: {
          in: allProductIds,
        },
        deletedAt: null,
      },
      select: StoreMapperUtil.REVIEW_RATING_WITH_PRODUCT_ID_SELECT,
    });

    // 상품별 후기 그룹화
    const reviewsByProductId = new Map<string, Array<{ rating: number }>>();
    for (const review of allReviews) {
      if (!reviewsByProductId.has(review.productId)) {
        reviewsByProductId.set(review.productId, []);
      }
      reviewsByProductId.get(review.productId)!.push({ rating: review.rating });
    }

    // 스토어별 후기 통계 계산 + 상품 대표이미지 배열
    const results = storesArray.map((store) => {
      const productIds = productsByStoreId.get(store.id) || [];
      const reviews: Array<{ rating: number }> = [];

      // 해당 스토어의 모든 상품에 대한 후기 수집
      for (const productId of productIds) {
        const productReviews = reviewsByProductId.get(productId) || [];
        reviews.push(...productReviews);
      }

      const totalReviewCount = reviews.length;
      let averageRating = 0;

      if (totalReviewCount > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        averageRating = Math.round((totalRating / totalReviewCount) * 10) / 10; // 소수점 첫째자리까지
      }

      const productRepresentativeImages = productIds.flatMap((id) => {
        const imageUrl = productRepresentativeImage.get(id);
        return imageUrl ? [{ productId: id, imageUrl }] : [];
      });

      const saleablePrices = storeSaleablePrices.get(store.id) ?? [];
      const minProductPrice = saleablePrices.length > 0 ? Math.min(...saleablePrices) : null;

      const businessCalendar = toStoreBusinessCalendarApiShape(
        businessCalendarStateFromStoreRow(store),
      );

      const refundCancellationPolicy = refundCancellationPolicyFromDb(
        store.refundCancellationPolicy,
      );

      return {
        id: store.id,
        userId: store.sellerId,
        businessNo: store.businessNo,
        representativeName: store.representativeName,
        openingDate: store.openingDate,
        businessName: store.businessName,
        businessSector: store.businessSector,
        businessType: store.businessType,
        permissionManagementNumber: store.permissionManagementNumber,
        // 기본 정보
        logoImageUrl: store.logoImageUrl ?? undefined,
        name: store.name,
        description: store.description ?? undefined,
        phoneNumber: store.phoneNumber ?? undefined,

        // 픽업장소
        address: store.address ?? "",
        roadAddress: store.roadAddress ?? "",
        detailAddress: store.detailAddress ?? "",
        zonecode: store.zonecode ?? "",
        latitude: store.latitude ?? 0,
        longitude: store.longitude ?? 0,
        // 정산 계좌 정보
        bankAccountNumber: store.bankAccountNumber ?? undefined,
        bankName: store.bankName ?? undefined,
        accountHolderName: store.accountHolderName ?? undefined,
        // 채널 정보
        kakaoChannelId: store.kakaoChannelId ?? undefined,
        instagramId: store.instagramId ?? undefined,
        // 기타
        likeCount: store.likeCount,
        averageRating,
        totalReviewCount,
        productRepresentativeImages,
        minProductPrice,
        businessCalendar,
        refundCancellationPolicy,
        createdAt: store.createdAt,
        updatedAt: store.updatedAt,
      };
    });

    return isSingle ? results[0] : results;
  }
}
