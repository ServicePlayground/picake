import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import { LoggerUtil } from "@apps/backend/common/utils/logger.util";
import {
  AUTH_ERROR_MESSAGES,
  AudienceConst,
  AUDIENCE,
} from "@apps/backend/modules/auth/constants/auth.constants";

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

  /** 이전 소프트 탈퇴(`isActive: false`) 계정이 남아 있으면 삭제해 재가입을 허용합니다. */
  async purgeIfInactiveConsumer(existing: { id: string; isActive: boolean }): Promise<boolean> {
    if (existing.isActive) return false;
    await this.prisma.consumer.delete({ where: { id: existing.id } });
    return true;
  }

  async purgeIfInactiveSeller(existing: { id: string; isActive: boolean }): Promise<boolean> {
    if (existing.isActive) return false;
    await this.prisma.seller.delete({ where: { id: existing.id } });
    return true;
  }
}
