import { Injectable } from "@nestjs/common";
import { Prisma, TermsType } from "@apps/backend/infra/database/prisma/generated/client";
import { TermsReadService } from "@apps/backend/modules/terms/services/terms-read.service";
import { TermsWriteService } from "@apps/backend/modules/terms/services/terms-write.service";
import {
  CreateTermsDocumentDto,
  TermsActiveMapResponseDto,
  TermsDocumentResponseDto,
  TermsVersionListResponseDto,
} from "@apps/backend/modules/terms/dto/terms.dto";

/**
 * 약관 서비스
 *
 * 약관 관련 기능을 통합해서 제공하는 파사드 서비스입니다.
 * 실제 비즈니스 로직은 services/ 하위 서비스들에 분리되어 있습니다.
 */
@Injectable()
export class TermsService {
  constructor(
    private readonly readService: TermsReadService,
    private readonly writeService: TermsWriteService,
  ) {}

  listActiveForAdmin(): Promise<TermsActiveMapResponseDto> {
    return this.readService.listActiveForAdmin();
  }

  listVersionsByType(type: TermsType): Promise<TermsVersionListResponseDto> {
    return this.readService.listVersionsByType(type);
  }

  findById(id: string): Promise<TermsDocumentResponseDto> {
    return this.readService.findById(id);
  }

  getActiveByType(type: TermsType): Promise<TermsDocumentResponseDto> {
    return this.readService.getActiveByType(type);
  }

  create(dto: CreateTermsDocumentDto): Promise<TermsDocumentResponseDto> {
    return this.writeService.create(dto);
  }

  activate(id: string): Promise<TermsDocumentResponseDto> {
    return this.writeService.activate(id);
  }

  recordConsumerAgreements(consumerId: string, termsDocumentIds: string[]): Promise<void> {
    return this.writeService.recordConsumerAgreements(consumerId, termsDocumentIds);
  }

  recordSellerAgreements(sellerId: string, termsDocumentIds: string[]): Promise<void> {
    return this.writeService.recordSellerAgreements(sellerId, termsDocumentIds);
  }

  recordConsumerAgreementsInTransaction(
    tx: Prisma.TransactionClient,
    consumerId: string,
    termsDocumentIds: string[],
  ): Promise<void> {
    return this.writeService.recordConsumerAgreementsInTransaction(
      tx,
      consumerId,
      termsDocumentIds,
    );
  }

  recordSellerAgreementsInTransaction(
    tx: Prisma.TransactionClient,
    sellerId: string,
    termsDocumentIds: string[],
  ): Promise<void> {
    return this.writeService.recordSellerAgreementsInTransaction(tx, sellerId, termsDocumentIds);
  }
}
