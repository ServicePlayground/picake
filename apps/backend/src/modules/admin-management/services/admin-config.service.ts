import { Injectable } from "@nestjs/common";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import { ADMIN_CONFIG_ID } from "@apps/backend/modules/admin-management/constants/admin-management.constants";
import {
  AdminConfigResponseDto,
  UpdateAdminConfigDto,
} from "@apps/backend/modules/admin-management/dto/admin-management-config.dto";

/**
 * 관리자 가입 설정(AdminConfig) 서비스
 */
@Injectable()
export class AdminConfigService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 가입 설정 조회 — Row가 없으면 requireApproval=false 기본값으로 생성
   */
  async getConfig(): Promise<AdminConfigResponseDto> {
    const config = await this.upsertDefault();
    return this.toResponse(config);
  }

  /**
   * 가입 설정 수정
   */
  async updateConfig(dto: UpdateAdminConfigDto): Promise<AdminConfigResponseDto> {
    const config = await this.prisma.adminConfig.upsert({
      where: { id: ADMIN_CONFIG_ID },
      create: { id: ADMIN_CONFIG_ID, requireApproval: dto.requireApproval },
      update: { requireApproval: dto.requireApproval },
    });
    return this.toResponse(config);
  }

  /**
   * 회원가입 시 승인 정책 조회
   */
  async getRequireApproval(): Promise<boolean> {
    const config = await this.upsertDefault();
    return config.requireApproval;
  }

  private async upsertDefault() {
    return this.prisma.adminConfig.upsert({
      where: { id: ADMIN_CONFIG_ID },
      create: { id: ADMIN_CONFIG_ID, requireApproval: false },
      update: {},
    });
  }

  private toResponse(config: {
    requireApproval: boolean;
    updatedAt: Date;
  }): AdminConfigResponseDto {
    return { requireApproval: config.requireApproval, updatedAt: config.updatedAt };
  }
}
