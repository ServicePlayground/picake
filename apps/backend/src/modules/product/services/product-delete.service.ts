import { Injectable } from "@nestjs/common";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import { JwtVerifiedPayload } from "@apps/backend/modules/auth/types/auth.types";
import { ProductOwnershipUtil } from "@apps/backend/modules/product/utils/product-ownership.util";
import { LoggerUtil } from "@apps/backend/common/utils/logger.util";

@Injectable()
export class ProductDeleteService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 상품 삭제 (판매자용)
   */
  async deleteProductForSeller(id: string, user: JwtVerifiedPayload) {
    // 상품 소유권 확인
    await ProductOwnershipUtil.verifyProductOwnership(this.prisma, id, user.sub, {
      sellerId: true,
    });

    try {
      await this.prisma.product.delete({
        where: {
          id,
        },
      });
    } catch (error: unknown) {
      LoggerUtil.log(
        `상품 삭제 실패: 트랜잭션 에러 - userId: ${user.sub}, productId: ${id}, error: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}
