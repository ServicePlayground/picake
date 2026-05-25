import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@apps/backend/infra/database/prisma/generated/client";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import {
  NOTICE_SELECT,
  NOTICE_ERROR_MESSAGES,
} from "@apps/backend/modules/notice/constants/notice.constants";
import {
  CreateNoticeDto,
  NoticeItemResponseDto,
  UpdateNoticeDto,
} from "@apps/backend/modules/notice/dto/notice.dto";

/**
 * 공지사항 생성·수정·삭제 서비스
 */
@Injectable()
export class NoticeWriteService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateNoticeDto): Promise<NoticeItemResponseDto> {
    return this.prisma.notice.create({
      data: {
        title: dto.title,
        content: dto.content,
        isPinned: dto.isPinned ?? false,
        isActive: dto.isActive ?? true,
      },
      select: NOTICE_SELECT,
    });
  }

  async update(id: string, dto: UpdateNoticeDto): Promise<NoticeItemResponseDto> {
    const existing = await this.prisma.notice.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException(NOTICE_ERROR_MESSAGES.NOT_FOUND);
    }

    const data: Prisma.NoticeUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.content !== undefined) data.content = dto.content;
    if (dto.isPinned !== undefined) data.isPinned = dto.isPinned;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    return this.prisma.notice.update({
      where: { id },
      data,
      select: NOTICE_SELECT,
    });
  }

  async remove(id: string): Promise<void> {
    const existing = await this.prisma.notice.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException(NOTICE_ERROR_MESSAGES.NOT_FOUND);
    }
    await this.prisma.notice.delete({ where: { id } });
  }
}
