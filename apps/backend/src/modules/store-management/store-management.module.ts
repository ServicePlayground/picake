import { Module } from "@nestjs/common";
import { DatabaseModule } from "@apps/backend/infra/database/database.module";
import { StoreManagementService } from "@apps/backend/modules/store-management/services/store-management.service";

/**
 * 스토어 관리(관리자) 모듈
 *
 * 관리자용 스토어 조회 도메인 로직을 둡니다.
 * 판매자용 스토어 CRUD는 `store` 모듈이 담당합니다.
 */
@Module({
  imports: [DatabaseModule],
  providers: [StoreManagementService],
  exports: [StoreManagementService],
})
export class StoreManagementModule {}
