import { Injectable, NotFoundException } from "@nestjs/common";
import { TermsType } from "@apps/backend/infra/database/prisma/generated/client";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import {
  TERMS_SELECT,
  TERMS_SUMMARY_SELECT,
  TERMS_ERROR_MESSAGES,
} from "@apps/backend/modules/terms/constants/terms.constants";
import {
  TermsActiveMapResponseDto,
  TermsDocumentResponseDto,
  TermsVersionListResponseDto,
} from "@apps/backend/modules/terms/dto/terms.dto";

/**
 * 약관 조회 서비스
 */
@Injectable()
export class TermsReadService {
  constructor(private readonly prisma: PrismaService) {}

  async listActiveForAdmin(): Promise<TermsActiveMapResponseDto> {
    const data = await this.prisma.termsDocument.findMany({
      where: { isActive: true },
      orderBy: [{ type: "asc" }, { effectiveAt: "desc" }],
      select: TERMS_SUMMARY_SELECT,
    });
    return { data };
  }

  async listVersionsByType(type: TermsType): Promise<TermsVersionListResponseDto> {
    const data = await this.prisma.termsDocument.findMany({
      where: { type },
      orderBy: { effectiveAt: "desc" },
      select: TERMS_SUMMARY_SELECT,
    });
    return { data };
  }

  async findById(id: string): Promise<TermsDocumentResponseDto> {
    const doc = await this.prisma.termsDocument.findUnique({
      where: { id },
      select: TERMS_SELECT,
    });
    if (!doc) throw new NotFoundException(TERMS_ERROR_MESSAGES.NOT_FOUND);
    return doc;
  }

  async getActiveByType(type: TermsType): Promise<TermsDocumentResponseDto> {
    const doc = await this.prisma.termsDocument.findFirst({
      where: { type, isActive: true },
      select: TERMS_SELECT,
    });
    if (!doc) throw new NotFoundException(TERMS_ERROR_MESSAGES.ACTIVE_NOT_FOUND);
    return doc;
  }
}
