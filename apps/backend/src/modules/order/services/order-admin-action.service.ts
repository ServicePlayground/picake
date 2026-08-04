import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import { Prisma } from "@apps/backend/infra/database/prisma/generated/client";
import {
  ORDER_ERROR_MESSAGES,
  OrderStatus,
} from "@apps/backend/modules/order/constants/order.constants";
import {
  AdminRefundCandidateListRequestDto,
  AdminRefundCandidateListResponseDto,
  AdminRevertToRefundPendingRequestDto,
} from "@apps/backend/modules/order/dto/order-admin-action.dto";
import { OrderResponseDto } from "@apps/backend/modules/order/dto/order-detail.dto";
import { OrderMapperUtil } from "@apps/backend/modules/order/utils/order-mapper.util";
import { isAdminRevertToRefundPendingAllowed } from "@apps/backend/modules/order/utils/order-status-transition.util";
import { OrderLifecycleHookService } from "@apps/backend/modules/order/services/order-lifecycle-hook.service";
import { ORDER_STATUS_TRANSITION_SOURCE } from "@apps/backend/modules/order/types/order-lifecycle.types";
import { calculatePaginationMeta } from "@apps/backend/common/utils/pagination.util";
import { LoggerUtil } from "@apps/backend/common/utils/logger.util";

/**
 * 관리자(운영자)가 호출하는 주문 액션 전용 서비스.
 *
 * 존재 이유: 취소완료(CANCEL_COMPLETED)는 나가는 경로가 없는 종착 상태입니다. 그런데 무통장입금이라
 * 서버는 입금 여부를 알 수 없어, 실제로 입금한 손님이 이 상태에 빠지면 환불을 처리할 수단이 없습니다.
 * 그 예외 구제(취소환불대기로 되돌리기)를 관리자에게만 엽니다.
 *
 * 판매자·사용자 액션 서비스와 달리 소유권 검증이 없습니다 — 관리자 권한은 컨트롤러의
 * `@Auth({ audiences: [AUDIENCE.ADMIN] })`에서 통제합니다.
 */
@Injectable()
export class OrderAdminActionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orderLifecycleHookService: OrderLifecycleHookService,
  ) {}

  /**
   * 환불 구제가 필요할 수 있는 주문 목록.
   *
   * 취소완료 주문만 대상입니다. 기한 만료 자동 취소 건(`paymentPendingExpiredAt`)이나
   * 입금자명이 남은 건(`depositorName`)은 실제 입금 가능성이 높아 먼저 보이도록 정렬합니다.
   */
  async listRefundCandidates(
    query: AdminRefundCandidateListRequestDto,
  ): Promise<AdminRefundCandidateListResponseDto> {
    const { page, limit, onlyPaymentExpired, excludeReverted, orderNumber, depositorName } = query;

    const where: Prisma.OrderWhereInput = { orderStatus: OrderStatus.CANCEL_COMPLETED };

    if (onlyPaymentExpired) {
      where.paymentPendingExpiredAt = { not: null };
    }
    if (excludeReverted) {
      where.adminRefundRevertedAt = null;
    }
    if (orderNumber) {
      where.orderNumber = { contains: orderNumber };
    }
    if (depositorName) {
      where.depositorName = { contains: depositorName };
    }

    const totalItems = await this.prisma.order.count({ where });
    const skip = (page - 1) * limit;

    const orders = await this.prisma.order.findMany({
      where,
      // 입금 정황이 있는 건(입금자명 → 만료 취소)을 위로 올립니다.
      orderBy: [
        { depositorName: { sort: "desc", nulls: "last" } },
        { paymentPendingExpiredAt: { sort: "desc", nulls: "last" } },
        { createdAt: "desc" },
      ],
      skip,
      take: limit,
      include: OrderMapperUtil.ORDER_ITEMS_INCLUDE,
    });

    return {
      data: orders.map((order) => OrderMapperUtil.mapToOrderResponse(order)),
      meta: calculatePaginationMeta(page, limit, totalItems),
    };
  }

  /**
   * 주문 상세 조회 (관리자). 소유권 제한 없이 어떤 주문이든 조회합니다.
   *
   * 판매자·사용자 조회와 달리 `syncOrderLifecycleById`를 호출하지 않습니다. 관리자 조회는
   * 사후 확인 목적이라, 조회 행위가 주문 상태를 바꾸면 안 되기 때문입니다.
   */
  async getOrderById(orderId: string): Promise<OrderResponseDto> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: OrderMapperUtil.ORDER_ITEMS_INCLUDE,
    });
    if (!order) {
      throw new NotFoundException(ORDER_ERROR_MESSAGES.NOT_FOUND);
    }
    return OrderMapperUtil.mapToOrderResponse(order);
  }

  /**
   * 취소완료 주문을 취소환불대기로 되돌립니다.
   *
   * 환불 계좌는 비운 채로 전환합니다. 되돌린 뒤 손님이 직접 입력하며, 그 안내는 상태 전이 훅의
   * 알림으로 나갑니다. 실제 환불 송금은 기존 취소환불대기 플로우에서 판매자가 집행합니다.
   */
  async revertToRefundPending(
    orderId: string,
    dto: AdminRevertToRefundPendingRequestDto,
  ): Promise<{ id: string }> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { orderStatus: true },
    });
    if (!order) {
      throw new NotFoundException(ORDER_ERROR_MESSAGES.NOT_FOUND);
    }

    const fromStatus = order.orderStatus as OrderStatus;
    if (!isAdminRevertToRefundPendingAllowed(fromStatus)) {
      LoggerUtil.log(
        `[OrderAdminAction] 되돌리기 실패: 상태 불일치 - orderId: ${orderId}, status: ${fromStatus}`,
      );
      throw new BadRequestException(ORDER_ERROR_MESSAGES.INVALID_STATUS_TRANSITION);
    }

    // 동시 요청으로 두 번 전환되는 것을 막기 위해 상태를 조건에 포함합니다.
    const { count } = await this.prisma.order.updateMany({
      where: { id: orderId, orderStatus: OrderStatus.CANCEL_COMPLETED },
      data: {
        orderStatus: OrderStatus.CANCEL_REFUND_PENDING,
        adminRefundRevertReason: dto.reason,
        adminRefundRevertedAt: new Date(),
      },
    });
    if (count !== 1) {
      throw new BadRequestException(ORDER_ERROR_MESSAGES.INVALID_STATUS_TRANSITION);
    }

    this.orderLifecycleHookService.afterOrderStatusTransition({
      orderId,
      fromStatus,
      toStatus: OrderStatus.CANCEL_REFUND_PENDING,
      source: ORDER_STATUS_TRANSITION_SOURCE.ADMIN_STATUS_UPDATE,
    });

    LoggerUtil.log(
      `[OrderAdminAction] 취소완료 → 취소환불대기 되돌림 - orderId: ${orderId}, reason: ${dto.reason}`,
    );
    return { id: orderId };
  }
}
