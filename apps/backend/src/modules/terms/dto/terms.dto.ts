import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from "class-validator";
import { TermsType } from "@apps/backend/infra/database/prisma/generated/client";
import { TERMS_TYPE_LABEL } from "@apps/backend/modules/terms/constants/terms.constants";

export class TermsDocumentResponseDto {
  @ApiProperty({ example: "clxxxxxxxxxxxxxxxx" })
  id: string;

  @ApiProperty({ enum: TermsType, example: TermsType.CONSUMER_TERMS_OF_SERVICE })
  type: TermsType;

  @ApiProperty({ example: "1.0" })
  version: string;

  @ApiProperty({ example: "서비스 이용약관" })
  title: string;

  @ApiProperty({ description: "HTML 형식 약관 본문" })
  content: string;

  @ApiProperty({ example: true, description: "현재 사용자에게 노출 중인 활성 버전 여부" })
  isActive: boolean;

  @ApiProperty({ example: "2026-06-01T00:00:00.000Z", description: "시행일" })
  effectiveAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class TermsDocumentSummaryResponseDto {
  @ApiProperty({ example: "clxxxxxxxxxxxxxxxx" })
  id: string;

  @ApiProperty({ enum: TermsType, example: TermsType.CONSUMER_TERMS_OF_SERVICE })
  type: TermsType;

  @ApiProperty({ example: "1.0" })
  version: string;

  @ApiProperty({ example: "서비스 이용약관" })
  title: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: "2026-06-01T00:00:00.000Z" })
  effectiveAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class TermsVersionListResponseDto {
  @ApiProperty({ type: [TermsDocumentSummaryResponseDto] })
  data: TermsDocumentSummaryResponseDto[];
}

export class TermsActiveMapResponseDto {
  @ApiProperty({
    description: "약관 타입별 현재 활성 버전 요약 목록",
    type: [TermsDocumentSummaryResponseDto],
  })
  data: TermsDocumentSummaryResponseDto[];
}

export class CreateTermsDocumentDto {
  @ApiProperty({
    enum: TermsType,
    example: TermsType.CONSUMER_TERMS_OF_SERVICE,
    description: `약관 유형:\n${Object.entries(TERMS_TYPE_LABEL)
      .map(([k, v]) => `- ${k}: ${v}`)
      .join("\n")}`,
  })
  @IsEnum(TermsType)
  type: TermsType;

  @ApiProperty({
    example: "1.0",
    description: "버전 (x.y 형식, 예: 1.0 / 1.1 / 2.0). 동일 타입 내 중복 불가.",
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+\.\d+$/, { message: "버전은 x.y 형식이어야 합니다. (예: 1.0, 1.1, 2.0)" })
  version: string;

  @ApiProperty({ example: "서비스 이용약관", description: "약관 제목" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: "HTML 형식 약관 본문" })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    example: "2026-06-01T00:00:00.000Z",
    description: "시행일 (ISO 8601). 이 날부터 법적 효력 발생.",
  })
  @IsDateString()
  effectiveAt: string;

  @ApiPropertyOptional({
    example: false,
    description: "등록 즉시 활성화 여부. true면 같은 타입의 기존 활성 버전이 비활성화됩니다.",
  })
  @IsOptional()
  activateNow?: boolean;
}
