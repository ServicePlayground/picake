import { Module } from "@nestjs/common";
import { UploadModule } from "@apps/backend/modules/upload/upload.module";
import { AuthModule } from "@apps/backend/modules/auth/auth.module";
import { AdminManagementModule } from "@apps/backend/modules/admin-management/admin-management.module";
import { HomeBannerModule } from "@apps/backend/modules/home-banner/home-banner.module";
import { TermsModule } from "@apps/backend/modules/terms/terms.module";
import { NoticeModule } from "@apps/backend/modules/notice/notice.module";
import { QnaModule } from "@apps/backend/modules/qna/qna.module";
import { AdminUploadController } from "@apps/backend/apis/admin/controllers/upload.controller";
import { AdminAuthController } from "@apps/backend/apis/admin/controllers/auth.controller";
import { AdminMypageController } from "@apps/backend/apis/admin/controllers/mypage.controller";
import { AdminManagementController } from "@apps/backend/apis/admin/controllers/admin-management.controller";
import { AdminHomeBannerController } from "@apps/backend/apis/admin/controllers/home-banner.controller";
import { AdminTermsController } from "@apps/backend/apis/admin/controllers/terms.controller";
import { AdminNoticeController } from "@apps/backend/apis/admin/controllers/notice.controller";
import { AdminQnaController } from "@apps/backend/apis/admin/controllers/qna.controller";

/**
 * Admin API 모듈
 *
 * 관리자 전용 API를 제공합니다.
 */
@Module({
  imports: [
    UploadModule,
    AuthModule,
    AdminManagementModule,
    HomeBannerModule,
    TermsModule,
    NoticeModule,
    QnaModule,
  ],
  controllers: [
    AdminUploadController,
    AdminAuthController,
    AdminMypageController,
    AdminManagementController,
    AdminHomeBannerController,
    AdminTermsController,
    AdminNoticeController,
    AdminQnaController,
  ],
})
export class AdminApiModule {}
