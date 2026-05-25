import { Injectable } from "@nestjs/common";
import { NoticeReadService } from "@apps/backend/modules/notice/services/notice-read.service";
import { NoticeWriteService } from "@apps/backend/modules/notice/services/notice-write.service";
import {
  CreateNoticeDto,
  NoticeItemResponseDto,
  NoticeListResponseDto,
  UpdateNoticeDto,
} from "@apps/backend/modules/notice/dto/notice.dto";

/**
 * 공지사항 서비스
 *
 * 공지사항 관련 기능을 통합해서 제공하는 파사드 서비스입니다.
 * 실제 비즈니스 로직은 services/ 하위 서비스들에 분리되어 있습니다.
 */
@Injectable()
export class NoticeService {
  constructor(
    private readonly readService: NoticeReadService,
    private readonly writeService: NoticeWriteService,
  ) {}

  listForAdmin(): Promise<NoticeListResponseDto> {
    return this.readService.listForAdmin();
  }

  listActiveForConsumer(): Promise<NoticeListResponseDto> {
    return this.readService.listActiveForConsumer();
  }

  create(dto: CreateNoticeDto): Promise<NoticeItemResponseDto> {
    return this.writeService.create(dto);
  }

  update(id: string, dto: UpdateNoticeDto): Promise<NoticeItemResponseDto> {
    return this.writeService.update(id, dto);
  }

  remove(id: string): Promise<void> {
    return this.writeService.remove(id);
  }
}
