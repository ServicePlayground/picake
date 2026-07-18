import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";
import { SellerVerificationStatus } from "@apps/backend/infra/database/prisma/generated/client";
import { PaginationMetaResponseDto } from "@apps/backend/common/dto/pagination-response.dto";
import { MemberListQueryDto } from "@apps/backend/modules/member-management/dto/member-management-common.dto";

/**
 * 판매자 목록 조회 쿼리 DTO
 */
export class MemberSellerListQueryDto extends MemberListQueryDto {
  @ApiPropertyOptional({
    description: "판매자 검증 상태 필터",
    enum: SellerVerificationStatus,
  })
  @IsOptional()
  @IsEnum(SellerVerificationStatus)
  verificationStatus?: SellerVerificationStatus;
}

/** 판매자 보유 스토어 요약 */
export class MemberSellerStoreDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ description: "스토어명" })
  name: string;
}

/**
 * 판매자 목록 항목 응답 DTO
 */
export class MemberSellerItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ description: "휴대폰 번호" })
  phone: string;

  @ApiProperty({ nullable: true })
  name: string | null;

  @ApiProperty({ nullable: true })
  nickname: string | null;

  @ApiProperty({ description: "휴대폰 인증 여부" })
  isPhoneVerified: boolean;

  @ApiProperty({ description: "활성 여부" })
  isActive: boolean;

  @ApiProperty({ nullable: true, description: "탈퇴 사유" })
  withdrawReason: string | null;

  @ApiProperty({ nullable: true, description: "탈퇴 일시 (null이면 미탈퇴)" })
  withdrawnAt: Date | null;

  @ApiProperty({ nullable: true, description: "구글 연동 이메일 (null이면 미연동)" })
  googleEmail: string | null;

  @ApiProperty({ nullable: true, description: "카카오 연동 이메일 (null이면 미연동)" })
  kakaoEmail: string | null;

  @ApiProperty({ description: "판매자 검증 상태", enum: SellerVerificationStatus })
  sellerVerificationStatus: SellerVerificationStatus;

  @ApiProperty({ description: "보유 스토어", type: [MemberSellerStoreDto] })
  stores: MemberSellerStoreDto[];

  @ApiProperty({ nullable: true })
  lastLoginAt: Date | null;

  @ApiProperty()
  createdAt: Date;
}

/**
 * 판매자 목록 조회 응답 DTO (페이지네이션)
 */
export class MemberSellerListResponseDto {
  @ApiProperty({ description: "판매자 목록", type: [MemberSellerItemResponseDto] })
  data: MemberSellerItemResponseDto[];

  @ApiProperty({ description: "페이지네이션 메타 정보", type: PaginationMetaResponseDto })
  meta: PaginationMetaResponseDto;
}
