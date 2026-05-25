import { Module } from "@nestjs/common";
import { DatabaseModule } from "@apps/backend/infra/database/database.module";
import { TermsService } from "@apps/backend/modules/terms/terms.service";
import { TermsReadService } from "@apps/backend/modules/terms/services/terms-read.service";
import { TermsWriteService } from "@apps/backend/modules/terms/services/terms-write.service";

/**
 * 약관 모듈
 */
@Module({
  imports: [DatabaseModule],
  providers: [TermsService, TermsReadService, TermsWriteService],
  exports: [TermsService],
})
export class TermsModule {}
