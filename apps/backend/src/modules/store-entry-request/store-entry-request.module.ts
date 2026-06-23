import { Module } from "@nestjs/common";
import { DatabaseModule } from "@apps/backend/infra/database/database.module";
import { StoreEntryRequestService } from "@apps/backend/modules/store-entry-request/store-entry-request.service";
import { StoreEntryRequestReadService } from "@apps/backend/modules/store-entry-request/services/store-entry-request-read.service";
import { StoreEntryRequestWriteService } from "@apps/backend/modules/store-entry-request/services/store-entry-request-write.service";

/**
 * 입점 요청 모듈
 * 미입점(카카오 장소) 스토어 입점 요청 기능을 제공합니다.
 */
@Module({
  imports: [DatabaseModule],
  providers: [
    StoreEntryRequestService,
    StoreEntryRequestReadService,
    StoreEntryRequestWriteService,
  ],
  exports: [StoreEntryRequestService],
})
export class StoreEntryRequestModule {}
