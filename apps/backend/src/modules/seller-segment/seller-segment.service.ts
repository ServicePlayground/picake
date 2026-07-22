import { Injectable } from "@nestjs/common";
import { SellerSegmentReadService } from "@apps/backend/modules/seller-segment/services/seller-segment-read.service";
import { SellerSegmentWriteService } from "@apps/backend/modules/seller-segment/services/seller-segment-write.service";
import {
  AutoAssignBySignupDateDto,
  AutoAssignResultResponseDto,
  CreateSellerSegmentDto,
  SellerSegmentListResponseDto,
  SellerSegmentResponseDto,
} from "@apps/backend/modules/seller-segment/dto/seller-segment.dto";

/**
 * 판매자 세그먼트 서비스
 *
 * "누구를 어떤 그룹으로 구분할지"만 다루는 파사드 서비스입니다. 혜택(쿠폰·수수료 우대 등)의
 * 종류·기간·인원은 이 모듈이 알지 못하며, 추후 별도 모듈이 여기서 정의한 세그먼트를 조회해서 사용합니다.
 * 실제 비즈니스 로직은 services/ 하위 서비스들에 분리되어 있습니다.
 */
@Injectable()
export class SellerSegmentService {
  constructor(
    private readonly readService: SellerSegmentReadService,
    private readonly writeService: SellerSegmentWriteService,
  ) {}

  list(): Promise<SellerSegmentListResponseDto> {
    return this.readService.list();
  }

  create(dto: CreateSellerSegmentDto): Promise<SellerSegmentResponseDto> {
    return this.writeService.create(dto);
  }

  autoAssignBySignupDate(
    segmentId: string,
    dto: AutoAssignBySignupDateDto,
  ): Promise<AutoAssignResultResponseDto> {
    return this.writeService.autoAssignBySignupDate(segmentId, dto);
  }
}
