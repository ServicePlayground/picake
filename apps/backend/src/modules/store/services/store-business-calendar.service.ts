import { BadRequestException, Injectable } from "@nestjs/common";
import { Prisma } from "@apps/backend/infra/database/prisma/generated/client";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import { JwtVerifiedPayload } from "@apps/backend/modules/auth/types/auth.types";
import { STORE_ERROR_MESSAGES } from "@apps/backend/modules/store/constants/store.constants";
import {
  StoreBusinessCalendarDto,
  UpdateStoreBusinessCalendarResponseDto,
} from "@apps/backend/modules/store/dto/store-business-calendar.dto";
import { StoreOwnershipUtil } from "@apps/backend/modules/store/utils/store-ownership.util";
import { isStoreBusinessFullDayWindow } from "@apps/backend/modules/store/constants/store-business-calendar.constants";
import {
  findStoreBusinessCalendarOrderConflicts,
  formatStoreBusinessCalendarConflictMessage,
  STORE_BUSINESS_CALENDAR_BLOCKING_ORDER_STATUSES,
} from "@apps/backend/modules/store/utils/store-business-calendar-order-conflict.util";
import {
  businessCalendarStateFromStoreRow,
  parseHalfHourTimeToMinutes,
  type StoreBusinessCalendarState,
} from "@apps/backend/modules/store/utils/store-business-calendar.util";

/**
 * 스토어 영업 캘린더(정기 휴무·표준 시간·일별 예외) 갱신.
 */
@Injectable()
export class StoreBusinessCalendarService {
  constructor(private readonly prisma: PrismaService) {}

  async updateForSeller(
    storeId: string,
    dto: StoreBusinessCalendarDto,
    user: JwtVerifiedPayload,
  ): Promise<UpdateStoreBusinessCalendarResponseDto> {
    await StoreOwnershipUtil.verifyStoreOwnership(this.prisma, storeId, user.sub);

    this.validateTimeRanges(dto);

    const proposedState = this.dtoToState(dto);
    await this.assertNoActiveOrderConflicts(storeId, proposedState);

    const normalizedOverrides = this.normalizeOverridesFromDto(dto.dayOverrides);

    await this.prisma.store.update({
      where: { id: storeId },
      data: {
        weeklyClosedWeekdays: [...new Set(dto.weeklyClosedWeekdays)].sort((a, b) => a - b),
        standardOpenTime: dto.standardOpenTime,
        standardCloseTime: dto.standardCloseTime,
        businessCalendarOverrides: normalizedOverrides as unknown as Prisma.InputJsonValue,
      },
    });

    const updated = await this.prisma.store.findUniqueOrThrow({ where: { id: storeId } });
    const state = businessCalendarStateFromStoreRow(updated);
    return { businessCalendar: this.stateToResponseDto(state) };
  }

  private dtoToState(dto: StoreBusinessCalendarDto): StoreBusinessCalendarState {
    return {
      weeklyClosedWeekdays: [...new Set(dto.weeklyClosedWeekdays)].sort((a, b) => a - b),
      standardOpenTime: dto.standardOpenTime,
      standardCloseTime: dto.standardCloseTime,
      dayOverrides: this.normalizeOverridesFromDto(dto.dayOverrides),
    };
  }

  private normalizeOverridesFromDto(
    dayOverrides: StoreBusinessCalendarDto["dayOverrides"],
  ): { date: string; isOpen: boolean; openTime?: string; closeTime?: string }[] {
    const map = new Map<
      string,
      { date: string; isOpen: boolean; openTime?: string; closeTime?: string }
    >();
    for (const o of dayOverrides) {
      map.set(o.date, {
        date: o.date,
        isOpen: o.isOpen,
        openTime: o.openTime,
        closeTime: o.closeTime,
      });
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([, v]) => v);
  }

  private stateToResponseDto(state: StoreBusinessCalendarState): StoreBusinessCalendarDto {
    return {
      weeklyClosedWeekdays: state.weeklyClosedWeekdays,
      standardOpenTime: state.standardOpenTime,
      standardCloseTime: state.standardCloseTime,
      dayOverrides: state.dayOverrides.map((o) => ({
        date: o.date,
        isOpen: o.isOpen,
        openTime: o.openTime,
        closeTime: o.closeTime,
      })),
    };
  }

  private async assertNoActiveOrderConflicts(
    storeId: string,
    proposedState: StoreBusinessCalendarState,
  ): Promise<void> {
    const activeOrders = await this.prisma.order.findMany({
      where: {
        storeId,
        orderStatus: { in: [...STORE_BUSINESS_CALENDAR_BLOCKING_ORDER_STATUSES] },
        pickupDate: { not: null },
      },
      select: {
        id: true,
        orderNumber: true,
        orderStatus: true,
        pickupDate: true,
      },
    });

    const conflicts = findStoreBusinessCalendarOrderConflicts(proposedState, activeOrders);
    if (conflicts.length === 0) return;

    throw new BadRequestException({
      message: formatStoreBusinessCalendarConflictMessage(conflicts),
      code: "BUSINESS_CALENDAR_ORDER_CONFLICT",
      conflicts: conflicts.map((c) => ({
        orderId: c.orderId,
        orderNumber: c.orderNumber,
        orderStatus: c.orderStatus,
        pickupDateSeoulKey: c.pickupDateSeoulKey,
        pickupTimeSeoul: c.pickupTimeSeoul,
      })),
    });
  }

  private validateTimeRanges(dto: StoreBusinessCalendarDto) {
    const so = parseHalfHourTimeToMinutes(dto.standardOpenTime);
    const sc = parseHalfHourTimeToMinutes(dto.standardCloseTime);
    const standardFullDay = isStoreBusinessFullDayWindow(
      dto.standardOpenTime,
      dto.standardCloseTime,
    );
    if (!standardFullDay && so >= sc) {
      throw new BadRequestException(STORE_ERROR_MESSAGES.BUSINESS_CALENDAR_STANDARD_TIME_ORDER);
    }
    for (const o of dto.dayOverrides) {
      if (o.isOpen) {
        if (!o.openTime || !o.closeTime) {
          throw new BadRequestException(
            STORE_ERROR_MESSAGES.BUSINESS_CALENDAR_OVERRIDE_OPEN_REQUIRES_TIMES,
          );
        }
        const overrideFullDay = isStoreBusinessFullDayWindow(o.openTime, o.closeTime);
        if (
          !overrideFullDay &&
          parseHalfHourTimeToMinutes(o.openTime) >= parseHalfHourTimeToMinutes(o.closeTime)
        ) {
          throw new BadRequestException(STORE_ERROR_MESSAGES.BUSINESS_CALENDAR_OVERRIDE_TIME_ORDER);
        }
      }
    }
  }
}
