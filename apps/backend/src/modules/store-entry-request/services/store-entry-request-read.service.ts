import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@apps/backend/infra/database/prisma/generated/client";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import { calculatePaginationMeta } from "@apps/backend/common/utils/pagination.util";
import {
  STORE_ENTRY_REQUEST_ADMIN_SELECT,
  STORE_ENTRY_REQUEST_ERROR_MESSAGES,
} from "@apps/backend/modules/store-entry-request/constants/store-entry-request.constants";
import {
  AdminStoreEntryRequestItemResponseDto,
  AdminStoreEntryRequestListQueryDto,
  AdminStoreEntryRequestListResponseDto,
} from "@apps/backend/modules/store-entry-request/dto/store-entry-request-admin.dto";
import { StoreEntryRequestExistsResponseDto } from "@apps/backend/modules/store-entry-request/dto/store-entry-request.dto";
import { buildStoreEntryRequestSearchWhere } from "@apps/backend/modules/store-entry-request/utils/store-entry-request-list-query.util";

type AdminRow = Prisma.StoreEntryRequestGetPayload<{
  select: typeof STORE_ENTRY_REQUEST_ADMIN_SELECT;
}>;

/**
 * 입점 요청 조회 서비스
 */
@Injectable()
export class StoreEntryRequestReadService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 현재 사용자가 해당 장소에 이미 입점 요청했는지 여부 (버튼 상태 표시용)
   */
  async existsForUser(
    consumerId: string,
    kakaoPlaceId: string,
  ): Promise<StoreEntryRequestExistsResponseDto> {
    const existing = await this.prisma.storeEntryRequest.findUnique({
      where: { consumerId_kakaoPlaceId: { consumerId, kakaoPlaceId } },
      select: { id: true },
    });

    return { requested: existing !== null };
  }

  /**
   * 관리자용 입점 요청 목록 (검색·페이지네이션, 최신 요청순)
   */
  async listForAdmin(
    query: AdminStoreEntryRequestListQueryDto,
  ): Promise<AdminStoreEntryRequestListResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where = buildStoreEntryRequestSearchWhere(query.search);

    const [rows, totalItems] = await Promise.all([
      this.prisma.storeEntryRequest.findMany({
        where,
        select: STORE_ENTRY_REQUEST_ADMIN_SELECT,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.storeEntryRequest.count({ where }),
    ]);

    const samePlaceCounts = await this.loadSamePlaceRequestCounts(
      rows.map((row) => row.kakaoPlaceId),
    );

    return {
      data: rows.map((row) => this.toAdminItemDto(row, samePlaceCounts.get(row.kakaoPlaceId) ?? 1)),
      meta: calculatePaginationMeta(page, limit, totalItems),
    };
  }

  /**
   * 관리자용 입점 요청 상세
   */
  async getByIdForAdmin(requestId: string): Promise<AdminStoreEntryRequestItemResponseDto> {
    const row = await this.prisma.storeEntryRequest.findUnique({
      where: { id: requestId },
      select: STORE_ENTRY_REQUEST_ADMIN_SELECT,
    });

    if (!row) {
      throw new NotFoundException(STORE_ENTRY_REQUEST_ERROR_MESSAGES.NOT_FOUND);
    }

    const samePlaceCount = await this.prisma.storeEntryRequest.count({
      where: { kakaoPlaceId: row.kakaoPlaceId },
    });

    return this.toAdminItemDto(row, samePlaceCount);
  }

  private async loadSamePlaceRequestCounts(kakaoPlaceIds: string[]): Promise<Map<string, number>> {
    const uniqueIds = [...new Set(kakaoPlaceIds)];
    if (uniqueIds.length === 0) {
      return new Map();
    }

    const groups = await this.prisma.storeEntryRequest.groupBy({
      by: ["kakaoPlaceId"],
      where: { kakaoPlaceId: { in: uniqueIds } },
      _count: { _all: true },
    });

    return new Map(groups.map((group) => [group.kakaoPlaceId, group._count._all]));
  }

  private toAdminItemDto(
    row: AdminRow,
    samePlaceRequestCount: number,
  ): AdminStoreEntryRequestItemResponseDto {
    const { consumer, ...rest } = row;
    return {
      ...rest,
      consumer,
      samePlaceRequestCount,
    };
  }
}
