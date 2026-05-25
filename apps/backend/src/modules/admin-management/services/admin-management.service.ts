import { Injectable } from "@nestjs/common";
import { AdminAccountService } from "@apps/backend/modules/admin-management/services/admin-account.service";
import { AdminConfigService } from "@apps/backend/modules/admin-management/services/admin-config.service";
import {
  AdminAccountItemResponseDto,
  AdminAccountListQueryDto,
  AdminAccountListResponseDto,
  UpdateAdminApprovalDto,
} from "@apps/backend/modules/admin-management/dto/admin-management-account.dto";
import {
  AdminConfigResponseDto,
  UpdateAdminConfigDto,
} from "@apps/backend/modules/admin-management/dto/admin-management-config.dto";

/**
 * 관리자 계정 관리 서비스
 *
 * 설정·계정 목록·승인 처리 API를 통합 제공합니다.
 */
@Injectable()
export class AdminManagementService {
  constructor(
    private readonly adminConfigService: AdminConfigService,
    private readonly adminAccountService: AdminAccountService,
  ) {}

  async getConfig(): Promise<AdminConfigResponseDto> {
    return await this.adminConfigService.getConfig();
  }

  async updateConfig(dto: UpdateAdminConfigDto): Promise<AdminConfigResponseDto> {
    return await this.adminConfigService.updateConfig(dto);
  }

  async listRequests(query: AdminAccountListQueryDto): Promise<AdminAccountListResponseDto> {
    return await this.adminAccountService.listRequests(query);
  }

  async listAccounts(query: AdminAccountListQueryDto): Promise<AdminAccountListResponseDto> {
    return await this.adminAccountService.listAccounts(query);
  }

  async updateApproval(
    adminId: string,
    dto: UpdateAdminApprovalDto,
  ): Promise<AdminAccountItemResponseDto> {
    return await this.adminAccountService.updateApproval(adminId, dto);
  }
}
