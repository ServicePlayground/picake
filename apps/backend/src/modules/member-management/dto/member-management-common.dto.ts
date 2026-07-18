import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";
import {
  MEMBER_STATUS_FILTER_VALUES,
  type MemberStatusFilter,
} from "@apps/backend/modules/member-management/constants/member-management.constants";

/**
 * 회원(구매자·판매자) 목록 조회 공통 쿼리 DTO
 */
export class MemberListQueryDto {
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
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: "검색어 (이름·닉네임·휴대폰 번호 부분 일치)" })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  search?: string;

  @ApiPropertyOptional({
    description: "회원 상태 필터 (ACTIVE: 활성, INACTIVE: 비활성, WITHDRAWN: 탈퇴)",
    enum: MEMBER_STATUS_FILTER_VALUES,
  })
  @IsOptional()
  @IsIn(MEMBER_STATUS_FILTER_VALUES)
  status?: MemberStatusFilter;
}

/**
 * 회원 계정 활성/비활성 변경 요청 DTO
 */
export class UpdateMemberActiveDto {
  @ApiProperty({ description: "활성 여부 (false면 로그인 등 이용이 제한됩니다)" })
  @IsBoolean()
  isActive: boolean;
}
