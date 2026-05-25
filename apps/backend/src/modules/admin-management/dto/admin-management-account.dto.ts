import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, Max, Min } from "class-validator";
import { AdminApprovalStatus } from "@apps/backend/infra/database/prisma/generated/client";
import { PaginationMetaResponseDto } from "@apps/backend/common/dto/pagination-response.dto";
import { SWAGGER_EXAMPLES } from "@apps/backend/modules/auth/constants/auth.constants";
import {
  ADMIN_APPROVAL_ACTION_VALUES,
  type AdminApprovalAction,
} from "@apps/backend/modules/admin-management/constants/admin-management.constants";

/**
 * 관리자 계정 목록 조회 쿼리 DTO
 */
export class AdminAccountListQueryDto {
  @ApiPropertyOptional({ description: "페이지 번호 (1부터 시작)", default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: "페이지당 항목 수", default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: "승인 상태 필터",
    enum: AdminApprovalStatus,
  })
  @IsOptional()
  @IsEnum(AdminApprovalStatus)
  approvalStatus?: AdminApprovalStatus;
}

/**
 * 가입 신청 승인/거절 요청 DTO
 */
export class UpdateAdminApprovalDto {
  @ApiProperty({
    description: "변경할 승인 상태 (APPROVED | REJECTED)",
    enum: ADMIN_APPROVAL_ACTION_VALUES,
  })
  @IsEnum(ADMIN_APPROVAL_ACTION_VALUES)
  approvalStatus: AdminApprovalAction;
}

/**
 * 관리자 계정 항목 응답 DTO
 */
export class AdminAccountItemResponseDto {
  @ApiProperty({ example: SWAGGER_EXAMPLES.ADMIN_DATA.id })
  id: string;

  @ApiProperty({ example: SWAGGER_EXAMPLES.ADMIN_DATA.username })
  username: string;

  @ApiProperty({ enum: AdminApprovalStatus })
  approvalStatus: AdminApprovalStatus;

  @ApiProperty({ example: SWAGGER_EXAMPLES.ADMIN_DATA.isActive })
  isActive: boolean;

  @ApiProperty({ example: SWAGGER_EXAMPLES.ADMIN_DATA.isTotpEnabled })
  isTotpEnabled: boolean;

  @ApiProperty({ nullable: true, example: SWAGGER_EXAMPLES.ADMIN_DATA.createdAt })
  approvedAt: Date | null;

  @ApiProperty({ nullable: true })
  rejectedAt: Date | null;

  @ApiProperty({ nullable: true, example: SWAGGER_EXAMPLES.ADMIN_DATA.lastLoginAt })
  lastLoginAt: Date | null;

  @ApiProperty({ example: SWAGGER_EXAMPLES.ADMIN_DATA.createdAt })
  createdAt: Date;
}

/**
 * 관리자 계정 목록 조회 응답 DTO (페이지네이션)
 */
export class AdminAccountListResponseDto {
  @ApiProperty({
    description: "관리자 계정 목록",
    type: [AdminAccountItemResponseDto],
  })
  data: AdminAccountItemResponseDto[];

  @ApiProperty({
    description: "페이지네이션 메타 정보",
    type: PaginationMetaResponseDto,
  })
  meta: PaginationMetaResponseDto;
}
