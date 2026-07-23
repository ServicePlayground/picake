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
 * 회원 탈퇴 — 계정을 "익명화 후 비활성화" 처리합니다(하드 삭제 아님).
 *
 * 전자상거래법상 계약·청약철회(5년), 대금결제·재화공급(5년), 소비자 분쟁처리(3년) 기록은
 * 탈퇴 이후에도 법정 보존 기간 동안 남아 있어야 합니다. Consumer/Seller row를 물리 삭제하면
 * Prisma `onDelete: Cascade`로 연결된 Order/OrderItem/약관동의이력까지 즉시 삭제되어 이 의무를
 * 위반하게 되므로, 계정 row 자체는 남기고 개인정보 보호법상 더 이상 보유할 필요가 없는 식별 정보만
 * 파기(null 처리·토큰화)합니다.
 *
 * - `isActive: false` — 세션 즉시 무효화(`JwtStrategy.validateConsumer/validateSeller`가 참조),
 *   관리자 회원 목록 등에서 활성 회원과 구분(`withdrawnAt` 존재 여부로 관리자 비활성화와 구분됨).
 * - `phone`/`googleId`/`kakaoId` 등 재가입 식별에 쓰이는 값은 파기 후 고유값으로 치환해, 관리자
 *   비활성(정지)과 달리 동일 OAuth·휴대폰으로 즉시 재가입이 가능하도록 유지합니다.
 * - `name`/`nickname`/`profileImageUrl` 등 더 이상 필요 없는 개인정보는 null 처리합니다.
 * - 주문(Order)·주문상품(OrderItem)·약관동의이력은 그대로 보존됩니다(법정 보존기간 경과 후 별도
 *   배치로 파기 필요 — 현재 미구현, 후속 작업).
 */
@Injectable()
export class AuthWithdrawService {
  constructor(private readonly prisma: PrismaService) {}

  async withdraw(audience: AudienceConst, accountId: string, reason: string): Promise<void> {
    LoggerUtil.log(
      `회원 탈퇴 요청: audience=${audience}, accountId=${accountId}, reasonLength=${reason.length}`,
    );

    if (audience === AUDIENCE.CONSUMER) {
      const row = await this.prisma.consumer.findUnique({
        where: { id: accountId },
        select: { id: true, withdrawnAt: true },
      });
      if (!row) {
        throw new NotFoundException(AUTH_ERROR_MESSAGES.USER_NOT_FOUND);
      }
      if (row.withdrawnAt) {
        // 이미 탈퇴 처리된 계정(중복 요청 등) — 재차 익명화하지 않음
        throw new NotFoundException(AUTH_ERROR_MESSAGES.USER_NOT_FOUND);
      }

      await this.assertNoActiveOrdersForConsumer(accountId);
      await this.prisma.consumer.update({
        where: { id: accountId },
        data: this.buildAnonymizedWithdrawalData(accountId, reason),
      });
      return;
    }

    if (audience === AUDIENCE.SELLER) {
      const row = await this.prisma.seller.findUnique({
        where: { id: accountId },
        select: { id: true, withdrawnAt: true },
      });
      if (!row) {
        throw new NotFoundException(AUTH_ERROR_MESSAGES.USER_NOT_FOUND);
      }
      if (row.withdrawnAt) {
        throw new NotFoundException(AUTH_ERROR_MESSAGES.USER_NOT_FOUND);
      }

      await this.assertNoActiveOrdersForSeller(accountId);
      await this.prisma.seller.update({
        where: { id: accountId },
        data: this.buildAnonymizedWithdrawalData(accountId, reason),
      });
      return;
    }

    if (audience === AUDIENCE.ADMIN) {
      // 관리자 계정은 소비자 보호 법령상 거래기록 보존 의무 대상이 아니므로 기존과 동일하게 완전
      // 삭제합니다.
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

  /**
   * 탈퇴 시 Consumer/Seller에 공통 적용할 익명화 데이터.
   * `phone`은 `@unique` 필수 컬럼이라 null 처리가 불가능해 계정 id 기반의 재사용 불가능한 값으로
   * 치환합니다(원래 번호는 어디에도 남지 않음). `googleId`/`kakaoId`는 nullable+unique라 null 처리로
   * 충분합니다(Postgres는 unique 컬럼의 null 다중값을 허용).
   */
  private buildAnonymizedWithdrawalData(accountId: string, reason: string) {
    return {
      isActive: false,
      withdrawnAt: new Date(),
      withdrawReason: reason,
      phone: `withdrawn_${accountId}`,
      isPhoneVerified: false,
      name: null,
      nickname: null,
      profileImageUrl: null,
      googleId: null,
      googleEmail: null,
      kakaoId: null,
      kakaoEmail: null,
    };
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
