import { Module } from "@nestjs/common";
import { DatabaseModule } from "@apps/backend/infra/database/database.module";
import { NoticeService } from "@apps/backend/modules/notice/notice.service";
import { NoticeReadService } from "@apps/backend/modules/notice/services/notice-read.service";
import { NoticeWriteService } from "@apps/backend/modules/notice/services/notice-write.service";

/**
 * 공지사항 모듈
 */
@Module({
  imports: [DatabaseModule],
  providers: [NoticeService, NoticeReadService, NoticeWriteService],
  exports: [NoticeService],
})
export class NoticeModule {}
