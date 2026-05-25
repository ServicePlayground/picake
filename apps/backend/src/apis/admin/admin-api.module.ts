import { Module } from "@nestjs/common";
import { UploadModule } from "@apps/backend/modules/upload/upload.module";
import { AuthModule } from "@apps/backend/modules/auth/auth.module";
import { AdminManagementModule } from "@apps/backend/modules/admin-management/admin-management.module";
import { HomeBannerModule } from "@apps/backend/modules/home-banner/home-banner.module";
import { AdminUploadController } from "@apps/backend/apis/admin/controllers/upload.controller";
import { AdminAuthController } from "@apps/backend/apis/admin/controllers/auth.controller";
import { AdminMypageController } from "@apps/backend/apis/admin/controllers/mypage.controller";
import { AdminManagementController } from "@apps/backend/apis/admin/controllers/admin-management.controller";
import { AdminHomeBannerController } from "@apps/backend/apis/admin/controllers/home-banner.controller";

/**
 * Admin API 모듈
 *
 * 관리자 전용 API를 제공합니다.
 */
@Module({
  imports: [UploadModule, AuthModule, AdminManagementModule, HomeBannerModule],
  controllers: [
    AdminUploadController,
    AdminAuthController,
    AdminMypageController,
    AdminManagementController,
    AdminHomeBannerController,
  ],
})
export class AdminApiModule {}
