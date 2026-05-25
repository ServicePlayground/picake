import { Module } from "@nestjs/common";
import { AuthModule } from "@apps/backend/modules/auth/auth.module";
import { AdminManagementModule } from "@apps/backend/modules/admin-management/admin-management.module";
import { AdminAuthController } from "./controllers/auth.controller";
import { AdminMypageController } from "./controllers/mypage.controller";
import { AdminManagementController } from "./controllers/admin-management.controller";

/**
 * Admin API 모듈
 *
 * 관리자 전용 API를 제공합니다.
 */
@Module({
  imports: [AuthModule, AdminManagementModule],
  controllers: [AdminAuthController, AdminMypageController, AdminManagementController],
})
export class AdminApiModule {}
