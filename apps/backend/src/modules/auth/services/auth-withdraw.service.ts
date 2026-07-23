import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import { LoggerUtil } from "@apps/backend/common/utils/logger.util";
import {
  AUTH_ERROR_MESSAGES,
  AudienceConst,
  AUDIENCE,
} from "@apps/backend/modules/auth/constants/auth.constants";
import { ORDER_STATUSES_BLOCKING_ACCOUNT_WITHDRAWAL } from "@apps/backend/modules/order/constants/order.constants";

/**
 * 회원 탈퇴 — 계정을 DB에서 완전 삭제합니다 (Prisma onDelete Cascade).
 * 관리자 비활성(`isActive: false`)과 달리, 탈퇴 후에는 동일 OAuth·휴대폰으로 신규 가입이 가능합니다.
 */
@Injectable()
export class AuthWithdrawService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 회원 탈퇴 — 계정 및 연관 데이터를 DB에서 삭제합니다 (Prisma onDelete Cascade).
   * 동일 OAuth·휴대폰으로 신규 가입이 가능해집니다.
   */
  async withdraw(audience: AudienceConst, accountId: string, reason: string): Promise<void> {
    LoggerUtil.log(
      `회원 탈퇴 요청: audience=${audience}, accountId=${accountId}, reasonLength=${reason.length}`,
    );

    if (audience === AUDIENCE.CONSUMER) {
      const row = await this.prisma.consumer.findUnique({
        where: { id: accountId },
        select: { id: true },
      });
      if (!row) {
        throw new NotFoundException(AUTH_ERROR_MESSAGES.USER_NOT_FOUND);
      }

      await this.assertNoActiveOrdersForConsumer(accountId);
      await this.prisma.consumer.delete({ where: { id: accountId } });
      return;
    }

    if (audience === AUDIENCE.SELLER) {
      const row = await this.prisma.seller.findUnique({
        where: { id: accountId },
        select: { id: true },
      });
      if (!row) {
        throw new NotFoundException(AUTH_ERROR_MESSAGES.USER_NOT_FOUND);
      }

      await this.assertNoActiveOrdersForSeller(accountId);
      await this.prisma.seller.delete({ where: { id: accountId } });
      return;
    }

    if (audience === AUDIENCE.ADMIN) {
      const row = await this.prisma.admin.findUnique({
        where: { id: accountId },
        select: { id: true },
      });
      if (!row) {
        throw new NotFoundException(AUTH_ERROR_MESSAGES.USER_NOT_FOUND);
      }

      await this.prisma.admin.delete({ where: { id: accountId } });
      return;
    }

    throw new NotFoundException(AUTH_ERROR_MESSAGES.USER_NOT_FOUND);
  }

  private async assertNoActiveOrdersForConsumer(consumerId: string): Promise<void> {
    const activeOrderCount = await this.prisma.order.count({
      where: {
        consumerId,
        orderStatus: { in: ORDER_STATUSES_BLOCKING_ACCOUNT_WITHDRAWAL },
      },
    });
    if (activeOrderCount > 0) {
      throw new BadRequestException(AUTH_ERROR_MESSAGES.WITHDRAW_BLOCKED_ACTIVE_ORDERS);
    }
  }

  private async assertNoActiveOrdersForSeller(sellerId: string): Promise<void> {
    const activeOrderCount = await this.prisma.order.count({
      where: {
        orderStatus: { in: ORDER_STATUSES_BLOCKING_ACCOUNT_WITHDRAWAL },
        store: { sellerId },
      },
    });
    if (activeOrderCount > 0) {
      throw new BadRequestException(AUTH_ERROR_MESSAGES.WITHDRAW_BLOCKED_ACTIVE_ORDERS);
    }
  }
}
