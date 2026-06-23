import { Injectable } from "@nestjs/common";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import {
  OrderListResponseDto,
  OrderListRequestDto,
} from "@apps/backend/modules/order/dto/order-list.dto";
import { Prisma } from "@apps/backend/infra/database/prisma/generated/client";
import { OrderMapperUtil } from "@apps/backend/modules/order/utils/order-mapper.util";
import {
  buildOrderOrderBy,
  mergeOrderPickupDateConditions,
} from "@apps/backend/modules/order/utils/order-list-query.util";
import { calculatePaginationMeta } from "@apps/backend/common/utils/pagination.util";
import { OrderResponseDto } from "@apps/backend/modules/order/dto/order-detail.dto";
import { OrderAutomationService } from "@apps/backend/modules/order/services/order-automation.service";

/**
 * 사용자용 주문 목록 조회 서비스
 * 사용자용 주문 목록 조회 관련 로직을 담당합니다.
 */
@Injectable()
export class OrderUserListService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orderAutomationService: OrderAutomationService,
  ) {}

  /**
   * 사용자용 주문 목록 조회 (사용자용)
   * 자신의 주문만 조회합니다.
   */
  async getUserOrdersForUser(
    query: OrderListRequestDto,
    userId: string,
  ): Promise<OrderListResponseDto> {
    const {
      page,
      limit,
      sortBy,
      type,
      storeId,
      orderStatus,
      startDate,
      endDate,
      orderNumber,
      productName,
      pickupStartDate,
      pickupEndDate,
    } = query;

    const where: Prisma.OrderWhereInput = {
      consumerId: userId,
    };

    mergeOrderPickupDateConditions(where, {
      type,
      pickupStartDate,
      pickupEndDate,
    });

    if (storeId) {
      where.storeId = storeId;
    }
    if (orderStatus) {
      where.orderStatus = orderStatus;
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDateTime;
      }
    }
    if (orderNumber) {
      where.orderNumber = { contains: orderNumber };
    }
    if (productName) {
      where.productName = { contains: productName };
    }

    const totalItems = await this.prisma.order.count({ where });
    const orderBy = buildOrderOrderBy(sortBy);
    const skip = (page - 1) * limit;

    const listFindArgs = {
      where,
      orderBy,
      skip,
      take: limit,
      include: OrderMapperUtil.ORDER_ITEMS_INCLUDE,
    } satisfies Prisma.OrderFindManyArgs;

    let orders = await this.prisma.order.findMany(listFindArgs);
    await this.orderAutomationService.syncOrderLifecycleForIds(orders.map((o) => o.id));
    orders = await this.prisma.order.findMany(listFindArgs);

    const data: OrderResponseDto[] = orders.map((order) =>
      OrderMapperUtil.mapToOrderResponse(order),
    );
    const meta = calculatePaginationMeta(page, limit, totalItems);

    return { data, meta };
  }
}
