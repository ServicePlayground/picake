import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@apps/backend/infra/database/prisma/generated/client";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import { calculatePaginationMeta } from "@apps/backend/common/utils/pagination.util";
import {
  MEMBER_CONSUMER_SELECT,
  MEMBER_MANAGEMENT_ERROR_MESSAGES,
} from "@apps/backend/modules/member-management/constants/member-management.constants";
import { UpdateMemberActiveDto } from "@apps/backend/modules/member-management/dto/member-management-common.dto";
import {
  MemberConsumerItemResponseDto,
  MemberConsumerListQueryDto,
  MemberConsumerListResponseDto,
} from "@apps/backend/modules/member-management/dto/member-management-consumer.dto";
import {
  buildMemberSearchWhere,
  buildMemberStatusWhere,
} from "@apps/backend/modules/member-management/utils/member-list-query.util";

type ConsumerRow = Prisma.ConsumerGetPayload<{ select: typeof MEMBER_CONSUMER_SELECT }>;

/**
 * 구매자 계정 목록·상태 변경 서비스
 */
@Injectable()
export class MemberConsumerService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 구매자 목록 조회 (검색·상태 필터·페이지네이션, 최신 가입순)
   */
  async list(query: MemberConsumerListQueryDto): Promise<MemberConsumerListResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ConsumerWhereInput = {
      ...buildMemberStatusWhere(query.status),
      ...buildMemberSearchWhere(query.search),
    };

    const [rows, totalItems] = await Promise.all([
      this.prisma.consumer.findMany({
        where,
        select: MEMBER_CONSUMER_SELECT,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.consumer.count({ where }),
    ]);

    return {
      data: rows.map((row) => this.toItemDto(row)),
      meta: calculatePaginationMeta(page, limit, totalItems),
    };
  }

  /**
   * 구매자 계정 활성/비활성 변경 (탈퇴 회원은 변경 불가)
   */
  async updateActive(
    consumerId: string,
    dto: UpdateMemberActiveDto,
  ): Promise<MemberConsumerItemResponseDto> {
    const consumer = await this.prisma.consumer.findUnique({
      where: { id: consumerId },
      select: { id: true, withdrawnAt: true },
    });

    if (!consumer) {
      throw new NotFoundException(MEMBER_MANAGEMENT_ERROR_MESSAGES.CONSUMER_NOT_FOUND);
    }
    if (consumer.withdrawnAt) {
      throw new BadRequestException(MEMBER_MANAGEMENT_ERROR_MESSAGES.MEMBER_WITHDRAWN);
    }

    const updated = await this.prisma.consumer.update({
      where: { id: consumerId },
      data: { isActive: dto.isActive },
      select: MEMBER_CONSUMER_SELECT,
    });

    return this.toItemDto(updated);
  }

  private toItemDto(row: ConsumerRow): MemberConsumerItemResponseDto {
    const { _count, ...rest } = row;
    return { ...rest, orderCount: _count.orders };
  }
}
