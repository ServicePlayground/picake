import { Module } from "@nestjs/common";
import { AuthModule } from "@apps/backend/modules/auth/auth.module";
import { AdminAuthController } from "./controllers/auth.controller";
import { AdminMypageController } from "./controllers/mypage.controller";

/**
 * Admin API 모듈
 *
 * 관리자 전용 API를 제공합니다.
 */
@Module({
  imports: [AuthModule],
  controllers: [AdminAuthController, AdminMypageController],
})
export class AdminApiModule {}
