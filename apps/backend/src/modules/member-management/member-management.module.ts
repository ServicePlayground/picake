import { Module } from "@nestjs/common";
import { DatabaseModule } from "@apps/backend/infra/database/database.module";
import { MemberConsumerService } from "@apps/backend/modules/member-management/services/member-consumer.service";
import { MemberManagementService } from "@apps/backend/modules/member-management/services/member-management.service";
import { MemberSellerService } from "@apps/backend/modules/member-management/services/member-seller.service";

/**
 * 회원(구매자·판매자) 관리 모듈
 *
 * 관리자용 회원 조회·계정 상태 변경 도메인 로직을 둡니다.
 * 관리자 계정 관리는 `admin-management`, 통계는 `statistics` 모듈이 담당합니다.
 */
@Module({
  imports: [DatabaseModule],
  providers: [MemberManagementService, MemberConsumerService, MemberSellerService],
  exports: [MemberManagementService],
})
export class MemberManagementModule {}
