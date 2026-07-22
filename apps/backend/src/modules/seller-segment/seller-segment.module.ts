import { Module } from "@nestjs/common";
import { DatabaseModule } from "@apps/backend/infra/database/database.module";
import { SellerSegmentService } from "@apps/backend/modules/seller-segment/seller-segment.service";
import { SellerSegmentReadService } from "@apps/backend/modules/seller-segment/services/seller-segment-read.service";
import { SellerSegmentWriteService } from "@apps/backend/modules/seller-segment/services/seller-segment-write.service";

/**
 * 판매자 세그먼트 모듈
 * 판매자를 임의의 그룹(세그먼트)으로 구분해 관리하는 기능을 제공합니다.
 * 오픈 초기 가입 판매자 구분, 추후 다른 캠페인 대상 구분 등에 재사용됩니다.
 */
@Module({
  imports: [DatabaseModule],
  providers: [SellerSegmentService, SellerSegmentReadService, SellerSegmentWriteService],
  exports: [SellerSegmentService],
})
export class SellerSegmentModule {}
