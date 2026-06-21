import { Injectable } from "@nestjs/common";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import { UpdateProductRequestDto } from "@apps/backend/modules/product/dto/product-update.dto";
import {
  EnableStatus,
  ProductType,
} from "@apps/backend/modules/product/constants/product.constants";
import { JwtVerifiedPayload } from "@apps/backend/modules/auth/types/auth.types";
import { Prisma } from "@apps/backend/infra/database/prisma/generated/client";
import { ProductOwnershipUtil } from "@apps/backend/modules/product/utils/product-ownership.util";
import { validateProductPrices } from "@apps/backend/modules/product/utils/product-price.util";
import { LoggerUtil } from "@apps/backend/common/utils/logger.util";

@Injectable()
export class ProductUpdateService {
  constructor(private readonly prisma: PrismaService) {}

  private isOptionWithId(value: unknown): value is Record<string, unknown> & { id: string } {
    return Boolean(
      value &&
      typeof value === "object" &&
      "id" in value &&
      typeof (value as { id: unknown }).id === "string",
    );
  }

  /**
   * 케이크 옵션용 랜덤 ID 생성
   * - 생성 시 한 번만 부여되고 이후에는 변경되지 않도록 사용
   */
  private generateOptionId(prefix: "size" | "flavor"): string {
    const random = Math.random().toString(36).substring(2, 10);
    return `${prefix}_${random}`;
  }

  /**
   * 케이크 옵션에 ID 부여 (기존 ID 유지, 새 옵션에는 새 ID 생성)
   */
  private processCakeOptionsWithIds(
    existingOptions: unknown[],
    newOptions: Array<{ id?: string }>,
    prefix: "size" | "flavor",
  ): Array<{ id: string }> {
    const existingOptionsById = new Map<string, Record<string, unknown> & { id: string }>();

    for (const option of existingOptions) {
      if (this.isOptionWithId(option)) {
        existingOptionsById.set(option.id, option);
      }
    }

    return newOptions.map((option) => {
      const existing =
        option.id && existingOptionsById.has(option.id)
          ? existingOptionsById.get(option.id)
          : undefined;

      const id = existing?.id ?? option.id ?? this.generateOptionId(prefix);

      return {
        ...existing,
        ...option,
        id,
      };
    });
  }

  /**
   * 상품 수정 (판매자용)
   */
  async updateProductForSeller(
    id: string,
    updateProductDto: UpdateProductRequestDto,
    user: JwtVerifiedPayload,
  ) {
    // 상품 소유권 확인
    await ProductOwnershipUtil.verifyProductOwnership(this.prisma, id, user.sub, {
      sellerId: true,
    });

    // 기존 상품 정보 조회 (옵션 업데이트를 위해 필요)
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: {
        originalPrice: true,
        salePrice: true,
        cakeSizeOptions: true,
        cakeFlavorOptions: true,
      },
    });

    const nextOriginalPrice = updateProductDto.originalPrice ?? product!.originalPrice;
    const nextSalePrice = updateProductDto.salePrice ?? product!.salePrice;

    validateProductPrices(nextOriginalPrice, nextSalePrice);

    const updateData: Prisma.ProductUpdateInput = {};

    if (updateProductDto.name !== undefined) {
      updateData.name = updateProductDto.name;
    }
    if (updateProductDto.images !== undefined) {
      updateData.images = updateProductDto.images;
    }
    if (updateProductDto.originalPrice !== undefined) {
      updateData.originalPrice = updateProductDto.originalPrice;
    }
    if (updateProductDto.salePrice !== undefined) {
      updateData.salePrice = updateProductDto.salePrice;
    }
    if (updateProductDto.salesStatus !== undefined) {
      updateData.salesStatus = updateProductDto.salesStatus;
    }
    if (updateProductDto.visibilityStatus !== undefined) {
      updateData.visibilityStatus = updateProductDto.visibilityStatus;
    }
    if (updateProductDto.cakeSizeOptions !== undefined) {
      const existingSizeOptions = Array.isArray(product?.cakeSizeOptions)
        ? product.cakeSizeOptions
        : [];
      const nextSizeOptions = this.processCakeOptionsWithIds(
        existingSizeOptions,
        updateProductDto.cakeSizeOptions ?? [],
        "size",
      );

      updateData.cakeSizeOptions = nextSizeOptions as unknown as Prisma.InputJsonValue;
    }

    if (updateProductDto.cakeFlavorOptions !== undefined) {
      const existingFlavorOptions = Array.isArray(product?.cakeFlavorOptions)
        ? product.cakeFlavorOptions
        : [];
      const nextFlavorOptions = this.processCakeOptionsWithIds(
        existingFlavorOptions,
        updateProductDto.cakeFlavorOptions ?? [],
        "flavor",
      );

      updateData.cakeFlavorOptions = nextFlavorOptions as unknown as Prisma.InputJsonValue;
    }
    if (updateProductDto.letteringVisible !== undefined) {
      updateData.letteringVisible = updateProductDto.letteringVisible;
    }
    if (updateProductDto.letteringMaxLength !== undefined) {
      updateData.letteringMaxLength = updateProductDto.letteringMaxLength;
    }
    if (updateProductDto.imageUploadEnabled !== undefined) {
      updateData.imageUploadEnabled = updateProductDto.imageUploadEnabled;
      updateData.productType =
        updateProductDto.imageUploadEnabled === EnableStatus.ENABLE
          ? ProductType.CUSTOM_CAKE
          : ProductType.BASIC_CAKE;
    }
    if (updateProductDto.detailDescription !== undefined) {
      updateData.detailDescription = updateProductDto.detailDescription;
    }
    if (updateProductDto.productCategoryTypes !== undefined) {
      updateData.productCategoryTypes = updateProductDto.productCategoryTypes;
    }
    if (updateProductDto.searchTags !== undefined) {
      updateData.searchTags = updateProductDto.searchTags;
    }
    if (updateProductDto.productNoticeFoodType !== undefined) {
      updateData.productNoticeFoodType = updateProductDto.productNoticeFoodType;
    }
    if (updateProductDto.productNoticeProducer !== undefined) {
      updateData.productNoticeProducer = updateProductDto.productNoticeProducer;
    }
    if (updateProductDto.productNoticeOrigin !== undefined) {
      updateData.productNoticeOrigin = updateProductDto.productNoticeOrigin;
    }
    if (updateProductDto.productNoticeAddress !== undefined) {
      updateData.productNoticeAddress = updateProductDto.productNoticeAddress;
    }
    if (updateProductDto.productNoticeManufactureDate !== undefined) {
      updateData.productNoticeManufactureDate = updateProductDto.productNoticeManufactureDate;
    }
    if (updateProductDto.productNoticeExpirationDate !== undefined) {
      updateData.productNoticeExpirationDate = updateProductDto.productNoticeExpirationDate;
    }
    if (updateProductDto.productNoticePackageCapacity !== undefined) {
      updateData.productNoticePackageCapacity = updateProductDto.productNoticePackageCapacity;
    }
    if (updateProductDto.productNoticePackageQuantity !== undefined) {
      updateData.productNoticePackageQuantity = updateProductDto.productNoticePackageQuantity;
    }
    if (updateProductDto.productNoticeIngredients !== undefined) {
      updateData.productNoticeIngredients = updateProductDto.productNoticeIngredients;
    }
    if (updateProductDto.productNoticeCalories !== undefined) {
      updateData.productNoticeCalories = updateProductDto.productNoticeCalories;
    }
    if (updateProductDto.productNoticeSafetyNotice !== undefined) {
      updateData.productNoticeSafetyNotice = updateProductDto.productNoticeSafetyNotice;
    }
    if (updateProductDto.productNoticeGmoNotice !== undefined) {
      updateData.productNoticeGmoNotice = updateProductDto.productNoticeGmoNotice;
    }
    if (updateProductDto.productNoticeImportNotice !== undefined) {
      updateData.productNoticeImportNotice = updateProductDto.productNoticeImportNotice;
    }
    if (updateProductDto.productNoticeCustomerService !== undefined) {
      updateData.productNoticeCustomerService = updateProductDto.productNoticeCustomerService;
    }

    try {
      const updatedProduct = await this.prisma.product.update({
        where: {
          id,
        },
        data: updateData,
      });

      return {
        id: updatedProduct.id,
      };
    } catch (error: unknown) {
      LoggerUtil.log(
        `상품 수정 실패: 트랜잭션 에러 - userId: ${user.sub}, productId: ${id}, error: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}
