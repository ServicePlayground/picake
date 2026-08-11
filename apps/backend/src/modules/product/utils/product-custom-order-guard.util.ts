import { BadRequestException } from "@nestjs/common";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import { CUSTOM_ORDER_ERROR_MESSAGES } from "@apps/backend/modules/custom-order/constants/custom-order.constants";

/**
 * 진행 중인 커스텀 주문 요청(REQUESTED/QUOTED)이 있으면 상품 판매 방식 변경·삭제를 막습니다.
 * 진행 중 요청이 붕 뜨는 것을 방지하기 위한 가드입니다.
 */
export async function assertNoActiveCustomOrderRequests(
  prisma: PrismaService,
  productId: string,
): Promise<void> {
  const activeCount = await prisma.customOrderRequest.count({
    where: { productId, status: { in: ["REQUESTED", "QUOTED"] } },
  });

  if (activeCount > 0) {
    throw new BadRequestException(CUSTOM_ORDER_ERROR_MESSAGES.PRODUCT_HAS_ACTIVE_REQUESTS);
  }
}
