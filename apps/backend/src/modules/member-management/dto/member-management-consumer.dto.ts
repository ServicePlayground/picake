import { ApiProperty } from "@nestjs/swagger";
import { PaginationMetaResponseDto } from "@apps/backend/common/dto/pagination-response.dto";
import { MemberListQueryDto } from "@apps/backend/modules/member-management/dto/member-management-common.dto";

/**
 * 구매자 목록 조회 쿼리 DTO
 */
export class MemberConsumerListQueryDto extends MemberListQueryDto {}

/**
 * 구매자 목록 항목 응답 DTO
 */
export class MemberConsumerItemResponseDto {
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

  @ApiProperty({ description: "누적 주문 수 (모든 상태)" })
  orderCount: number;

  @ApiProperty({ nullable: true })
  lastLoginAt: Date | null;

  @ApiProperty()
  createdAt: Date;
}

/**
 * 구매자 목록 조회 응답 DTO (페이지네이션)
 */
export class MemberConsumerListResponseDto {
  @ApiProperty({ description: "구매자 목록", type: [MemberConsumerItemResponseDto] })
  data: MemberConsumerItemResponseDto[];

  @ApiProperty({ description: "페이지네이션 메타 정보", type: PaginationMetaResponseDto })
  meta: PaginationMetaResponseDto;
}
