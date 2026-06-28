import { Injectable } from "@nestjs/common";
import { StoreEntryRequestReadService } from "@apps/backend/modules/store-entry-request/services/store-entry-request-read.service";
import { StoreEntryRequestWriteService } from "@apps/backend/modules/store-entry-request/services/store-entry-request-write.service";
import {
  CreateStoreEntryRequestDto,
  StoreEntryRequestExistsResponseDto,
} from "@apps/backend/modules/store-entry-request/dto/store-entry-request.dto";

/**
 * 입점 요청 서비스
 * 미입점(카카오 장소) 스토어 입점 요청 관련 기능을 통합 제공합니다.
 */
@Injectable()
export class StoreEntryRequestService {
  constructor(
    private readonly readService: StoreEntryRequestReadService,
    private readonly writeService: StoreEntryRequestWriteService,
  ) {}

  /**
   * 입점 요청 추가 (사용자용)
   */
  createForUser(consumerId: string, dto: CreateStoreEntryRequestDto) {
    return this.writeService.createForUser(consumerId, dto);
  }

  /**
   * 현재 사용자의 입점 요청 존재 여부 (사용자용)
   */
  existsForUser(
    consumerId: string,
    kakaoPlaceId: string,
  ): Promise<StoreEntryRequestExistsResponseDto> {
    return this.readService.existsForUser(consumerId, kakaoPlaceId);
  }
}
