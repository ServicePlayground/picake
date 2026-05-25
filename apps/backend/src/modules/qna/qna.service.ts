import { Injectable } from "@nestjs/common";
import { QnaReadService } from "@apps/backend/modules/qna/services/qna-read.service";
import { QnaWriteService } from "@apps/backend/modules/qna/services/qna-write.service";
import {
  CreateQnaDto,
  QnaGroupedListResponseDto,
  QnaItemResponseDto,
  QnaListResponseDto,
  UpdateQnaDto,
} from "@apps/backend/modules/qna/dto/qna.dto";

/**
 * Q&A 서비스
 *
 * Q&A 관련 기능을 통합해서 제공하는 파사드 서비스입니다.
 * 실제 비즈니스 로직은 services/ 하위 서비스들에 분리되어 있습니다.
 */
@Injectable()
export class QnaService {
  constructor(
    private readonly readService: QnaReadService,
    private readonly writeService: QnaWriteService,
  ) {}

  listForAdmin(): Promise<QnaListResponseDto> {
    return this.readService.listForAdmin();
  }

  listGroupedForConsumer(): Promise<QnaGroupedListResponseDto> {
    return this.readService.listGroupedForConsumer();
  }

  create(dto: CreateQnaDto): Promise<QnaItemResponseDto> {
    return this.writeService.create(dto);
  }

  update(id: string, dto: UpdateQnaDto): Promise<QnaItemResponseDto> {
    return this.writeService.update(id, dto);
  }

  remove(id: string): Promise<void> {
    return this.writeService.remove(id);
  }
}
