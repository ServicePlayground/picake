import { Module } from "@nestjs/common";
import { DatabaseModule } from "@apps/backend/infra/database/database.module";
import { QnaService } from "@apps/backend/modules/qna/qna.service";
import { QnaReadService } from "@apps/backend/modules/qna/services/qna-read.service";
import { QnaWriteService } from "@apps/backend/modules/qna/services/qna-write.service";

/**
 * Q&A 모듈
 */
@Module({
  imports: [DatabaseModule],
  providers: [QnaService, QnaReadService, QnaWriteService],
  exports: [QnaService],
})
export class QnaModule {}
