import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@apps/backend/infra/database/prisma/generated/client";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import { QNA_SELECT, QNA_ERROR_MESSAGES } from "@apps/backend/modules/qna/constants/qna.constants";
import {
  CreateQnaDto,
  QnaItemResponseDto,
  UpdateQnaDto,
} from "@apps/backend/modules/qna/dto/qna.dto";

/**
 * Q&A 생성·수정·삭제 서비스
 */
@Injectable()
export class QnaWriteService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateQnaDto): Promise<QnaItemResponseDto> {
    return this.prisma.qna.create({
      data: {
        question: dto.question,
        answer: dto.answer,
        category: dto.category ?? "",
        isPinned: dto.isPinned ?? false,
        isActive: dto.isActive ?? true,
      },
      select: QNA_SELECT,
    });
  }

  async update(id: string, dto: UpdateQnaDto): Promise<QnaItemResponseDto> {
    const existing = await this.prisma.qna.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException(QNA_ERROR_MESSAGES.NOT_FOUND);
    }

    const data: Prisma.QnaUpdateInput = {};
    if (dto.question !== undefined) data.question = dto.question;
    if (dto.answer !== undefined) data.answer = dto.answer;
    if (dto.category !== undefined) data.category = dto.category;
    if (dto.isPinned !== undefined) data.isPinned = dto.isPinned;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    return this.prisma.qna.update({
      where: { id },
      data,
      select: QNA_SELECT,
    });
  }

  async remove(id: string): Promise<void> {
    const existing = await this.prisma.qna.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException(QNA_ERROR_MESSAGES.NOT_FOUND);
    }
    await this.prisma.qna.delete({ where: { id } });
  }
}
