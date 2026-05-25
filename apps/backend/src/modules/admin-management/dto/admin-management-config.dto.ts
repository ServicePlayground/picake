import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";
import { SWAGGER_EXAMPLES } from "@apps/backend/modules/auth/constants/auth.constants";

/**
 * 관리자 가입 설정 수정 요청 DTO
 */
export class UpdateAdminConfigDto {
  @ApiProperty({
    description:
      "가입 승인 필요 여부. true: 기존 관리자 승인 후 로그인 가능 / false: 가입 즉시 로그인 가능",
  })
  @IsBoolean()
  requireApproval: boolean;
}

/**
 * 관리자 가입 설정 응답 DTO
 */
export class AdminConfigResponseDto {
  @ApiProperty({ description: "가입 승인 필요 여부" })
  requireApproval: boolean;

  @ApiProperty({
    description: "설정 마지막 수정 시각",
    example: SWAGGER_EXAMPLES.ADMIN_DATA.createdAt,
  })
  updatedAt: Date;
}
