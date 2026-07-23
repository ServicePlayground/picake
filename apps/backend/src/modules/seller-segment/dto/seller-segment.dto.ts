import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsString, Matches, MaxLength, MinLength } from "class-validator";

/**
 * 세그먼트 생성 요청 DTO
 *
 * key는 코드/캠페인 참조용 고정 식별자이므로 등록 후에는 변경할 수 없다.
 */
export class CreateSellerSegmentDto {
  @ApiProperty({
    example: "EARLY_BIRD_2026",
    description: "세그먼트 식별 키 (영문 대문자·숫자·언더스코어). 등록 후 변경 불가, 중복 불가.",
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[A-Z0-9_]+$/, {
    message: "key는 영문 대문자·숫자·언더스코어(_)만 사용할 수 있습니다.",
  })
  key: string;

  @ApiProperty({
    example: "오픈 초기 가입 판매자 (~2026-08-31)",
    description: "어드민 화면에 노출할 이름. 기준·목적을 함께 적어두면 나중에 알아보기 쉽습니다.",
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  label: string;
}

export class SellerSegmentResponseDto {
  @ApiProperty({ example: "clxxxxxxxxxxxxxxxx" })
  id: string;

  @ApiProperty({ example: "EARLY_BIRD_2026" })
  key: string;

  @ApiProperty({ example: "오픈 초기 가입 판매자 (~2026-08-31)" })
  label: string;

  @ApiProperty({ description: "현재 소속 판매자 수" })
  memberCount: number;

  @ApiProperty()
  createdAt: Date;
}

export class SellerSegmentListResponseDto {
  @ApiProperty({ type: [SellerSegmentResponseDto] })
  data: SellerSegmentResponseDto[];
}

/**
 * 가입일 기준 자동 편입 요청 DTO
 *
 * "지금까지 가입한 판매자 중 cutoffDate 이전(포함) 가입자"를 세그먼트에 편입한다.
 * 이미 소속된 판매자는 건너뛴다(중복 편입 없음). 여러 번 실행해도 안전(idempotent)하다.
 */
export class AutoAssignBySignupDateDto {
  @ApiProperty({
    example: "2026-08-31T23:59:59.999Z",
    description: "이 시각 이전(포함)에 가입한 판매자를 편입 대상으로 산정",
  })
  @IsDateString()
  cutoffDate: string;
}

export class AutoAssignResultResponseDto {
  @ApiProperty({ description: "이번 실행으로 새로 편입된 판매자 수" })
  addedCount: number;

  @ApiProperty({ description: "이미 소속되어 있어 건너뛴 판매자 수" })
  alreadyMemberCount: number;

  @ApiProperty({ description: "cutoffDate 기준 전체 대상 판매자 수 (신규+기존 합)" })
  totalEligible: number;
}
