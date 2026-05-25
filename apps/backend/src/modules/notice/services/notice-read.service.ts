import { Injectable } from "@nestjs/common";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import {
  NOTICE_LIST_ORDER_BY,
  NOTICE_SELECT,
} from "@apps/backend/modules/notice/constants/notice.constants";
import {
  NoticeItemResponseDto,
  NoticeListResponseDto,
} from "@apps/backend/modules/notice/dto/notice.dto";

/**
 * 공지사항 조회 서비스
 */
@Injectable()
export class NoticeReadService {
  constructor(private readonly prisma: PrismaService) {}

  async listForAdmin(): Promise<NoticeListResponseDto> {
    const data = await this.prisma.notice.findMany({
      orderBy: [...NOTICE_LIST_ORDER_BY],
      select: NOTICE_SELECT,
    });
    return { data };
  }

  async listActiveForConsumer(): Promise<NoticeListResponseDto> {
    const data = await this.prisma.notice.findMany({
      where: { isActive: true },
      orderBy: [...NOTICE_LIST_ORDER_BY],
      select: NOTICE_SELECT,
    });
    return { data };
  }

  async findById(id: string): Promise<NoticeItemResponseDto | null> {
    return this.prisma.notice.findUnique({
      where: { id },
      select: NOTICE_SELECT,
    });
  }
}
