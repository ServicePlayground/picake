import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import {
  SELLER_SEGMENT_ERROR_MESSAGES,
  SELLER_SEGMENT_SELECT,
} from "@apps/backend/modules/seller-segment/constants/seller-segment.constants";
import {
  AutoAssignBySignupDateDto,
  AutoAssignResultResponseDto,
  CreateSellerSegmentDto,
  SellerSegmentResponseDto,
} from "@apps/backend/modules/seller-segment/dto/seller-segment.dto";

/**
 * 세그먼트 생성·가입일 기준 자동 편입 서비스
 *
 * 중복 편입은 항상 무시(스킵)되어 여러 번 실행해도 안전(idempotent)하다.
 */
@Injectable()
export class SellerSegmentWriteService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSellerSegmentDto): Promise<SellerSegmentResponseDto> {
    const existing = await this.prisma.sellerSegment.findUnique({
      where: { key: dto.key },
      select: { id: true },
    });
    if (existing) {
      throw new BadRequestException(SELLER_SEGMENT_ERROR_MESSAGES.KEY_DUPLICATE);
    }

    const segment = await this.prisma.sellerSegment.create({
      data: {
        key: dto.key,
        label: dto.label,
      },
      select: SELLER_SEGMENT_SELECT,
    });

    return { ...segment, memberCount: segment._count.memberships };
  }

  /**
   * 가입일 기준 자동 편입 — cutoffDate 이전(포함) 가입한 판매자를 이 세그먼트에 편입한다.
   * 기준일은 정책이 정해질 때마다 호출 시점에 지정하며(스키마에 고정하지 않음), 여러 번 실행해도
   * 이미 편입된 판매자는 건너뛴다.
   */
  async autoAssignBySignupDate(
    segmentId: string,
    dto: AutoAssignBySignupDateDto,
  ): Promise<AutoAssignResultResponseDto> {
    const segment = await this.prisma.sellerSegment.findUnique({
      where: { id: segmentId },
      select: { id: true },
    });
    if (!segment) {
      throw new NotFoundException(SELLER_SEGMENT_ERROR_MESSAGES.SEGMENT_NOT_FOUND);
    }

    const cutoffDate = new Date(dto.cutoffDate);

    const eligibleSellers = await this.prisma.seller.findMany({
      where: { createdAt: { lte: cutoffDate } },
      select: { id: true },
    });
    const totalEligible = eligibleSellers.length;

    if (totalEligible === 0) {
      return { addedCount: 0, alreadyMemberCount: 0, totalEligible: 0 };
    }

    const existingMemberships = await this.prisma.sellerSegmentMembership.findMany({
      where: {
        segmentId,
        sellerId: { in: eligibleSellers.map((s) => s.id) },
      },
      select: { sellerId: true },
    });
    const alreadyMemberIds = new Set(existingMemberships.map((m) => m.sellerId));
    const newSellerIds = eligibleSellers
      .map((s) => s.id)
      .filter((id) => !alreadyMemberIds.has(id));

    if (newSellerIds.length > 0) {
      await this.prisma.sellerSegmentMembership.createMany({
        data: newSellerIds.map((sellerId) => ({
          sellerId,
          segmentId,
          note: `가입일 기준 자동 산정 (~${dto.cutoffDate})`,
        })),
        skipDuplicates: true,
      });
    }

    return {
      addedCount: newSellerIds.length,
      alreadyMemberCount: alreadyMemberIds.size,
      totalEligible,
    };
  }
}
