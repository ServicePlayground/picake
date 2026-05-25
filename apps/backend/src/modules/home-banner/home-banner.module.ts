import { Module } from "@nestjs/common";
import { DatabaseModule } from "@apps/backend/infra/database/database.module";
import { HomeBannerService } from "@apps/backend/modules/home-banner/home-banner.service";
import { HomeBannerReadService } from "@apps/backend/modules/home-banner/services/home-banner-read.service";
import { HomeBannerWriteService } from "@apps/backend/modules/home-banner/services/home-banner-write.service";

/**
 * 홈 배너 모듈
 */
@Module({
  imports: [DatabaseModule],
  providers: [HomeBannerService, HomeBannerReadService, HomeBannerWriteService],
  exports: [HomeBannerService],
})
export class HomeBannerModule {}
