import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@apps/backend/infra/database/prisma/generated/client";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import { calculatePaginationMeta } from "@apps/backend/common/utils/pagination.util";
import {
  MEMBER_MANAGEMENT_ERROR_MESSAGES,
  MEMBER_SELLER_SELECT,
} from "@apps/backend/modules/member-management/constants/member-management.constants";
import { UpdateMemberActiveDto } from "@apps/backend/modules/member-management/dto/member-management-common.dto";
import {
  MemberSellerItemResponseDto,
  MemberSellerListQueryDto,
  MemberSellerListResponseDto,
} from "@apps/backend/modules/member-management/dto/member-management-seller.dto";
import {
  buildMemberSearchWhere,
  buildMemberStatusWhere,
} from "@apps/backend/modules/member-management/utils/member-list-query.util";

/**
 * 판매자 계정 목록·상태 변경 서비스
 */
@Injectable()
export class MemberSellerService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 판매자 목록 조회 (검색·상태·검증 상태 필터·페이지네이션, 최신 가입순)
   */
  async list(query: MemberSellerListQueryDto): Promise<MemberSellerListResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.SellerWhereInput = {
      ...buildMemberStatusWhere(query.status),
      ...buildMemberSearchWhere(query.search),
      ...(query.verificationStatus ? { sellerVerificationStatus: query.verificationStatus } : {}),
    };

    const [rows, totalItems] = await Promise.all([
      this.prisma.seller.findMany({
        where,
        select: MEMBER_SELLER_SELECT,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.seller.count({ where }),
    ]);

    return {
      data: rows,
      meta: calculatePaginationMeta(page, limit, totalItems),
    };
  }

  /**
   * 판매자 계정 활성/비활성 변경 (탈퇴 회원은 변경 불가)
   */
  async updateActive(
    sellerId: string,
    dto: UpdateMemberActiveDto,
  ): Promise<MemberSellerItemResponseDto> {
    const seller = await this.prisma.seller.findUnique({
      where: { id: sellerId },
      select: { id: true, withdrawnAt: true },
    });

    if (!seller) {
      throw new NotFoundException(MEMBER_MANAGEMENT_ERROR_MESSAGES.SELLER_NOT_FOUND);
    }
    if (seller.withdrawnAt) {
      throw new BadRequestException(MEMBER_MANAGEMENT_ERROR_MESSAGES.MEMBER_WITHDRAWN);
    }

    return this.prisma.seller.update({
      where: { id: sellerId },
      data: { isActive: dto.isActive },
      select: MEMBER_SELLER_SELECT,
    });
  }
}
