import { Injectable } from "@nestjs/common";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import { CreateProductRequestDto } from "@apps/backend/modules/product/dto/product-create.dto";
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
export class ProductCreateService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 케이크 옵션용 랜덤 ID 생성
   * - 생성 시 한 번만 부여되고 이후에는 변경되지 않도록 사용
   */
  private generateOptionId(prefix: "size" | "flavor"): string {
    const random = Math.random().toString(36).substring(2, 10);
    return `${prefix}_${random}`;
  }

  /**
   * 상품 등록 (판매자용)
   */
  async createProductForSeller(
    createProductDto: CreateProductRequestDto,
    user: JwtVerifiedPayload,
  ) {
    // 스토어 소유권 확인
    await ProductOwnershipUtil.verifyStoreOwnership(
      this.prisma,
      createProductDto.storeId,
      user.sub,
    );

    validateProductPrices(createProductDto.originalPrice, createProductDto.salePrice);

    try {
      return await this.prisma.$transaction(
        async (tx) => {
          const now = new Date();
          const dateStr = now.toISOString().split("T")[0].replace(/-/g, "");

          const startOfDay = new Date(now);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(now);
          endOfDay.setHours(23, 59, 59, 999);

          const millisOfDay = now.getTime() - startOfDay.getTime();
          const timePart = String(millisOfDay).padStart(8, "0");
          const randomPart = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
          const productNumber = `${dateStr}-${timePart}${randomPart}`;

          const productType =
            createProductDto.imageUploadEnabled === EnableStatus.ENABLE
              ? ProductType.CUSTOM_CAKE
              : ProductType.BASIC_CAKE;

          const cakeSizeOptionsWithId = createProductDto.cakeSizeOptions
            ? createProductDto.cakeSizeOptions.map((option) => ({
                ...option,
                id: option.id ?? this.generateOptionId("size"),
              }))
            : [];

          const cakeFlavorOptionsWithId = createProductDto.cakeFlavorOptions
            ? createProductDto.cakeFlavorOptions.map((option) => ({
                ...option,
                id: option.id ?? this.generateOptionId("flavor"),
              }))
            : [];

          const productData: Prisma.ProductCreateInput = {
            store: {
              connect: {
                id: createProductDto.storeId,
              },
            },
            name: createProductDto.name,
            images: createProductDto.images || [],
            originalPrice: createProductDto.originalPrice,
            salePrice: createProductDto.salePrice,
            salesStatus: createProductDto.salesStatus,
            visibilityStatus: createProductDto.visibilityStatus,
            cakeSizeOptions: cakeSizeOptionsWithId as unknown as Prisma.InputJsonValue,
            cakeFlavorOptions: cakeFlavorOptionsWithId as unknown as Prisma.InputJsonValue,
            letteringVisible: createProductDto.letteringVisible,
            letteringMaxLength: createProductDto.letteringMaxLength,
            imageUploadEnabled: createProductDto.imageUploadEnabled,
            productType,
            productCategoryTypes: createProductDto.productCategoryTypes ?? [],
            searchTags: createProductDto.searchTags ?? [],
            detailDescription: createProductDto.detailDescription,
            productNumber,
            productNoticeFoodType: createProductDto.productNoticeFoodType,
            productNoticeProducer: createProductDto.productNoticeProducer,
            productNoticeOrigin: createProductDto.productNoticeOrigin,
            productNoticeAddress: createProductDto.productNoticeAddress,
            productNoticeManufactureDate: createProductDto.productNoticeManufactureDate,
            productNoticeExpirationDate: createProductDto.productNoticeExpirationDate,
            productNoticePackageCapacity: createProductDto.productNoticePackageCapacity,
            productNoticePackageQuantity: createProductDto.productNoticePackageQuantity,
            productNoticeIngredients: createProductDto.productNoticeIngredients,
            productNoticeCalories: createProductDto.productNoticeCalories,
            productNoticeSafetyNotice: createProductDto.productNoticeSafetyNotice,
            productNoticeGmoNotice: createProductDto.productNoticeGmoNotice,
            productNoticeImportNotice: createProductDto.productNoticeImportNotice,
            productNoticeCustomerService: createProductDto.productNoticeCustomerService,
          };

          const product = await tx.product.create({
            data: productData,
          });

          return {
            id: product.id,
          };
        },
        {
          maxWait: 5000, // 최대 대기 시간 (5초)
          timeout: 10000, // 타임아웃 (10초)
        },
      );
    } catch (error: unknown) {
      LoggerUtil.log(
        `상품 생성 실패: 트랜잭션 에러 - userId: ${user.sub}, storeId: ${createProductDto.storeId}, error: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}
