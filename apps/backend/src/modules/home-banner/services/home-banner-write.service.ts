import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@apps/backend/infra/database/prisma/generated/client";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import {
  HOME_BANNER_MAX_COUNT,
  HOME_BANNER_SELECT,
  HOME_BANNER_ERROR_MESSAGES,
} from "@apps/backend/modules/home-banner/constants/home-banner.constants";
import {
  CreateHomeBannerDto,
  HomeBannerItemResponseDto,
  ReorderHomeBannerDto,
  UpdateHomeBannerDto,
} from "@apps/backend/modules/home-banner/dto/home-banner.dto";
import { assertValidHomeBannerPeriod } from "@apps/backend/modules/home-banner/utils/home-banner-period.util";

/**
 * 홈 배너 생성·수정·삭제·순서 변경 서비스
 */
@Injectable()
export class HomeBannerWriteService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateHomeBannerDto): Promise<HomeBannerItemResponseDto> {
    await this.assertWithinMaxCount();

    const startsAt = dto.startsAt ? new Date(dto.startsAt) : null;
    const endsAt = dto.endsAt ? new Date(dto.endsAt) : null;
    this.validatePeriod(startsAt, endsAt);

    const maxSort = await this.prisma.homeBanner.aggregate({
      _max: { sortOrder: true },
    });
    const nextSortOrder = (maxSort._max.sortOrder ?? -1) + 1;

    return this.prisma.homeBanner.create({
      data: {
        imageUrl: dto.imageUrl,
        linkUrl: dto.linkUrl ?? null,
        startsAt,
        endsAt,
        isActive: dto.isActive ?? true,
        sortOrder: nextSortOrder,
      },
      select: HOME_BANNER_SELECT,
    });
  }

  async update(id: string, dto: UpdateHomeBannerDto): Promise<HomeBannerItemResponseDto> {
    const existing = await this.prisma.homeBanner.findUnique({
      where: { id },
      select: HOME_BANNER_SELECT,
    });
    if (!existing) {
      throw new NotFoundException(HOME_BANNER_ERROR_MESSAGES.NOT_FOUND);
    }

    const startsAt =
      dto.startsAt === undefined ? existing.startsAt : dto.startsAt ? new Date(dto.startsAt) : null;
    const endsAt =
      dto.endsAt === undefined ? existing.endsAt : dto.endsAt ? new Date(dto.endsAt) : null;
    this.validatePeriod(startsAt, endsAt);

    const data: Prisma.HomeBannerUpdateInput = {};
    if (dto.imageUrl !== undefined) data.imageUrl = dto.imageUrl;
    if (dto.linkUrl !== undefined) data.linkUrl = dto.linkUrl;
    if (dto.startsAt !== undefined) data.startsAt = startsAt;
    if (dto.endsAt !== undefined) data.endsAt = endsAt;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    return this.prisma.homeBanner.update({
      where: { id },
      data,
      select: HOME_BANNER_SELECT,
    });
  }

  async remove(id: string): Promise<void> {
    const existing = await this.prisma.homeBanner.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException(HOME_BANNER_ERROR_MESSAGES.NOT_FOUND);
    }
    await this.prisma.homeBanner.delete({ where: { id } });
  }

  async reorder(dto: ReorderHomeBannerDto): Promise<void> {
    const items = await this.prisma.homeBanner.findMany({
      select: { id: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    const existingIds = new Set(items.map((item) => item.id));
    const incomingIds = new Set(dto.orderedIds);

    if (
      existingIds.size !== incomingIds.size ||
      dto.orderedIds.some((id) => !existingIds.has(id))
    ) {
      throw new BadRequestException(HOME_BANNER_ERROR_MESSAGES.REORDER_IDS_MISMATCH);
    }

    await this.prisma.$transaction(
      dto.orderedIds.map((id, index) =>
        this.prisma.homeBanner.update({
          where: { id },
          data: { sortOrder: index },
        }),
      ),
    );
  }

  private validatePeriod(startsAt: Date | null, endsAt: Date | null): void {
    try {
      assertValidHomeBannerPeriod(startsAt, endsAt);
    } catch {
      throw new BadRequestException(HOME_BANNER_ERROR_MESSAGES.INVALID_DISPLAY_PERIOD);
    }
  }

  private async assertWithinMaxCount(): Promise<void> {
    const count = await this.prisma.homeBanner.count();
    if (count >= HOME_BANNER_MAX_COUNT) {
      throw new BadRequestException(HOME_BANNER_ERROR_MESSAGES.MAX_COUNT_EXCEEDED);
    }
  }
}
