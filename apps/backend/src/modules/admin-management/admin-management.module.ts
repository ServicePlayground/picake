import { Module } from "@nestjs/common";
import { AdminAccountService } from "@apps/backend/modules/admin-management/services/admin-account.service";
import { AdminConfigService } from "@apps/backend/modules/admin-management/services/admin-config.service";
import { AdminManagementService } from "@apps/backend/modules/admin-management/services/admin-management.service";

@Module({
  providers: [AdminConfigService, AdminAccountService, AdminManagementService],
  exports: [AdminConfigService, AdminManagementService],
})
export class AdminManagementModule {}
