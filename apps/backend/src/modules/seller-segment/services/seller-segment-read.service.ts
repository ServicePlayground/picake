import { Injectable } from "@nestjs/common";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import { SELLER_SEGMENT_SELECT } from "@apps/backend/modules/seller-segment/constants/seller-segment.constants";
import {
  SellerSegmentListResponseDto,
  SellerSegmentResponseDto,
} from "@apps/backend/modules/seller-segment/dto/seller-segment.dto";

/**
 * 세그먼트 조회 서비스
 */
@Injectable()
export class SellerSegmentReadService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<SellerSegmentListResponseDto> {
    const rows = await this.prisma.sellerSegment.findMany({
      select: SELLER_SEGMENT_SELECT,
      orderBy: { createdAt: "desc" },
    });

    return { data: rows.map(mapSegment) };
  }
}

function mapSegment(segment: {
  id: string;
  key: string;
  label: string;
  createdAt: Date;
  _count: { memberships: number };
}): SellerSegmentResponseDto {
  return {
    id: segment.id,
    key: segment.key,
    label: segment.label,
    memberCount: segment._count.memberships,
    createdAt: segment.createdAt,
  };
}
