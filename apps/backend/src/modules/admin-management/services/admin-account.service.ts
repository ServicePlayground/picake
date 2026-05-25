import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@apps/backend/infra/database/prisma/generated/client";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import { calculatePaginationMeta } from "@apps/backend/common/utils/pagination.util";
import {
  ADMIN_ACCOUNT_SELECT,
  ADMIN_MANAGEMENT_ERROR_MESSAGES,
} from "@apps/backend/modules/admin-management/constants/admin-management.constants";
import {
  AdminAccountItemResponseDto,
  AdminAccountListQueryDto,
  AdminAccountListResponseDto,
  UpdateAdminApprovalDto,
} from "@apps/backend/modules/admin-management/dto/admin-management-account.dto";

/**
 * 관리자 계정 목록·승인 처리 서비스
 */
@Injectable()
export class AdminAccountService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * PENDING 상태 가입 신청 목록 조회
   */
  async listRequests(query: AdminAccountListQueryDto): Promise<AdminAccountListResponseDto> {
    return this.listByWhere({ approvalStatus: "PENDING" }, query);
  }

  /**
   * 관리자 계정 전체 목록 조회 (승인 상태 필터 optional)
   */
  async listAccounts(query: AdminAccountListQueryDto): Promise<AdminAccountListResponseDto> {
    const where = query.approvalStatus ? { approvalStatus: query.approvalStatus } : {};
    return this.listByWhere(where, query);
  }

  /**
   * 가입 신청 승인 또는 거절
   */
  async updateApproval(
    adminId: string,
    dto: UpdateAdminApprovalDto,
  ): Promise<AdminAccountItemResponseDto> {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
      select: { id: true, approvalStatus: true },
    });

    if (!admin) {
      throw new NotFoundException(ADMIN_MANAGEMENT_ERROR_MESSAGES.ADMIN_NOT_FOUND);
    }

    if (admin.approvalStatus !== "PENDING") {
      throw new BadRequestException(ADMIN_MANAGEMENT_ERROR_MESSAGES.APPROVAL_ALREADY_PROCESSED);
    }

    const now = new Date();
    return this.prisma.admin.update({
      where: { id: adminId },
      data: {
        approvalStatus: dto.approvalStatus,
        approvedAt: dto.approvalStatus === "APPROVED" ? now : null,
        rejectedAt: dto.approvalStatus === "REJECTED" ? now : null,
      },
      select: ADMIN_ACCOUNT_SELECT,
    });
  }

  private async listByWhere(
    where: Prisma.AdminWhereInput,
    query: AdminAccountListQueryDto,
  ): Promise<AdminAccountListResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [items, totalItems] = await Promise.all([
      this.prisma.admin.findMany({
        where,
        select: ADMIN_ACCOUNT_SELECT,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.admin.count({ where }),
    ]);

    return {
      data: items,
      meta: calculatePaginationMeta(page, limit, totalItems),
    };
  }
}
