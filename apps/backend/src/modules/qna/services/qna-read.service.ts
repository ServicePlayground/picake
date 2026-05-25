import { Injectable } from "@nestjs/common";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import { QNA_LIST_ORDER_BY, QNA_SELECT } from "@apps/backend/modules/qna/constants/qna.constants";
import {
  QnaGroupedListResponseDto,
  QnaItemResponseDto,
  QnaListResponseDto,
} from "@apps/backend/modules/qna/dto/qna.dto";

/**
 * Q&A 조회 서비스
 */
@Injectable()
export class QnaReadService {
  constructor(private readonly prisma: PrismaService) {}

  async listForAdmin(): Promise<QnaListResponseDto> {
    const data = await this.prisma.qna.findMany({
      orderBy: [...QNA_LIST_ORDER_BY],
      select: QNA_SELECT,
    });
    return { data };
  }

  async listGroupedForConsumer(): Promise<QnaGroupedListResponseDto> {
    const rows = await this.prisma.qna.findMany({
      where: { isActive: true },
      orderBy: [...QNA_LIST_ORDER_BY],
      select: QNA_SELECT,
    });

    const grouped = new Map<string, QnaItemResponseDto[]>();
    for (const row of rows) {
      const key = row.category || "";
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(row);
    }

    const data = Array.from(grouped.entries()).map(([category, items]) => ({
      category,
      items,
    }));

    return { data };
  }

  async findById(id: string): Promise<QnaItemResponseDto | null> {
    return this.prisma.qna.findUnique({
      where: { id },
      select: QNA_SELECT,
    });
  }
}
