import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@apps/backend/infra/database/prisma/generated/client";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import {
  TERMS_SELECT,
  TERMS_ERROR_MESSAGES,
} from "@apps/backend/modules/terms/constants/terms.constants";
import {
  CreateTermsDocumentDto,
  TermsDocumentResponseDto,
} from "@apps/backend/modules/terms/dto/terms.dto";

/**
 * 약관 생성·활성화·동의 이력 서비스
 *
 * 버전 관리 정책:
 * - 약관 수정은 항상 새 버전 등록으로만 가능 (기존 레코드 내용 변경 불가)
 * - 활성화(activate)는 동일 타입의 기존 활성 버전을 비활성화하고 새 버전을 활성화함
 * - 삭제 없음 — 이력은 영구 보존
 */
@Injectable()
export class TermsWriteService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTermsDocumentDto): Promise<TermsDocumentResponseDto> {
    const existing = await this.prisma.termsDocument.findUnique({
      where: { type_version: { type: dto.type, version: dto.version } },
      select: { id: true },
    });
    if (existing) {
      throw new BadRequestException(TERMS_ERROR_MESSAGES.VERSION_DUPLICATE);
    }

    const effectiveAt = new Date(dto.effectiveAt);

    if (dto.activateNow) {
      return this.prisma.$transaction(async (tx) => {
        await tx.termsDocument.updateMany({
          where: { type: dto.type, isActive: true },
          data: { isActive: false },
        });

        return tx.termsDocument.create({
          data: {
            type: dto.type,
            version: dto.version,
            title: dto.title,
            content: dto.content,
            effectiveAt,
            isActive: true,
          },
          select: TERMS_SELECT,
        });
      });
    }

    return this.prisma.termsDocument.create({
      data: {
        type: dto.type,
        version: dto.version,
        title: dto.title,
        content: dto.content,
        effectiveAt,
        isActive: false,
      },
      select: TERMS_SELECT,
    });
  }

  async activate(id: string): Promise<TermsDocumentResponseDto> {
    const doc = await this.prisma.termsDocument.findUnique({
      where: { id },
      select: { id: true, type: true },
    });
    if (!doc) throw new NotFoundException(TERMS_ERROR_MESSAGES.NOT_FOUND);

    return this.prisma.$transaction(async (tx) => {
      await tx.termsDocument.updateMany({
        where: { type: doc.type, isActive: true },
        data: { isActive: false },
      });

      return tx.termsDocument.update({
        where: { id },
        data: { isActive: true },
        select: TERMS_SELECT,
      });
    });
  }

  async recordConsumerAgreements(consumerId: string, termsDocumentIds: string[]): Promise<void> {
    if (termsDocumentIds.length === 0) return;

    await this.prisma.$transaction(async (tx) => {
      await this.upsertConsumerAgreements(tx, consumerId, termsDocumentIds);
    });
  }

  async recordSellerAgreements(sellerId: string, termsDocumentIds: string[]): Promise<void> {
    if (termsDocumentIds.length === 0) return;

    await this.prisma.$transaction(async (tx) => {
      await this.upsertSellerAgreements(tx, sellerId, termsDocumentIds);
    });
  }

  /** 회원가입 등 기존 트랜잭션 안에서 동의 이력 기록 */
  async recordConsumerAgreementsInTransaction(
    tx: Prisma.TransactionClient,
    consumerId: string,
    termsDocumentIds: string[],
  ): Promise<void> {
    await this.upsertConsumerAgreements(tx, consumerId, termsDocumentIds);
  }

  async recordSellerAgreementsInTransaction(
    tx: Prisma.TransactionClient,
    sellerId: string,
    termsDocumentIds: string[],
  ): Promise<void> {
    await this.upsertSellerAgreements(tx, sellerId, termsDocumentIds);
  }

  private async upsertConsumerAgreements(
    tx: Prisma.TransactionClient,
    consumerId: string,
    termsDocumentIds: string[],
  ): Promise<void> {
    if (termsDocumentIds.length === 0) return;

    await Promise.all(
      termsDocumentIds.map((termsDocumentId) =>
        tx.consumerTermsAgreement.upsert({
          where: { consumerId_termsDocumentId: { consumerId, termsDocumentId } },
          update: {},
          create: { consumerId, termsDocumentId },
        }),
      ),
    );
  }

  private async upsertSellerAgreements(
    tx: Prisma.TransactionClient,
    sellerId: string,
    termsDocumentIds: string[],
  ): Promise<void> {
    if (termsDocumentIds.length === 0) return;

    await Promise.all(
      termsDocumentIds.map((termsDocumentId) =>
        tx.sellerTermsAgreement.upsert({
          where: { sellerId_termsDocumentId: { sellerId, termsDocumentId } },
          update: {},
          create: { sellerId, termsDocumentId },
        }),
      ),
    );
  }
}
