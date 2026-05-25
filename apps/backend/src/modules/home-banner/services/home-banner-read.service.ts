import { Injectable } from "@nestjs/common";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import { HOME_BANNER_SELECT } from "@apps/backend/modules/home-banner/constants/home-banner.constants";
import {
  HomeBannerItemResponseDto,
  HomeBannerListResponseDto,
} from "@apps/backend/modules/home-banner/dto/home-banner.dto";
import { isHomeBannerVisibleNow } from "@apps/backend/modules/home-banner/utils/home-banner-period.util";

/**
 * 홈 배너 조회 서비스
 */
@Injectable()
export class HomeBannerReadService {
  constructor(private readonly prisma: PrismaService) {}

  async listForAdmin(): Promise<HomeBannerListResponseDto> {
    const data = await this.prisma.homeBanner.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: HOME_BANNER_SELECT,
    });
    return { data };
  }

  async listActiveForConsumer(): Promise<HomeBannerListResponseDto> {
    const now = new Date();

    const rows = await this.prisma.homeBanner.findMany({
      where: {
        isActive: true,
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
        ],
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: HOME_BANNER_SELECT,
    });

    return { data: rows.filter((row) => isHomeBannerVisibleNow(row, now)) };
  }

  async findById(id: string): Promise<HomeBannerItemResponseDto | null> {
    return this.prisma.homeBanner.findUnique({
      where: { id },
      select: HOME_BANNER_SELECT,
    });
  }
}
