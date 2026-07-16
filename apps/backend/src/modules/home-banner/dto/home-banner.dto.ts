import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from "class-validator";
import { HomeBannerImageAlign } from "@apps/backend/modules/home-banner/constants/home-banner.constants";
import { SWAGGER_EXAMPLES } from "@apps/backend/modules/upload/constants/upload.constants";

export class HomeBannerItemResponseDto {
  @ApiProperty({ example: "clxxxxxxxxxxxxxxxx" })
  id: string;

  @ApiProperty({ example: SWAGGER_EXAMPLES.FILE_URL })
  imageUrl: string;

  @ApiProperty({
    enum: HomeBannerImageAlign,
    example: HomeBannerImageAlign.CENTER,
    description: "이미지 가로 정렬 (구매자 화면에서 잘리는 방향 제어)",
  })
  imageAlign: HomeBannerImageAlign;

  @ApiPropertyOptional({ example: "https://picakes.com/event" })
  linkUrl: string | null;

  @ApiPropertyOptional({
    description: "노출 시작 시각 (ISO 8601, null이면 즉시)",
    example: "2026-05-25T00:00:00.000Z",
  })
  startsAt: Date | null;

  @ApiPropertyOptional({
    description: "노출 종료 시각 (ISO 8601, null이면 무기한)",
    example: "2026-06-30T23:59:59.000Z",
  })
  endsAt: Date | null;

  @ApiProperty({ example: 0 })
  sortOrder: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class HomeBannerListResponseDto {
  @ApiProperty({ type: [HomeBannerItemResponseDto] })
  data: HomeBannerItemResponseDto[];
}

export class CreateHomeBannerDto {
  @ApiProperty({ example: SWAGGER_EXAMPLES.FILE_URL })
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @ApiPropertyOptional({
    enum: HomeBannerImageAlign,
    default: HomeBannerImageAlign.CENTER,
    description: "이미지 가로 정렬 (미입력 시 CENTER)",
  })
  @IsOptional()
  @IsEnum(HomeBannerImageAlign)
  imageAlign?: HomeBannerImageAlign;

  @ApiPropertyOptional({ example: "https://picakes.com/event" })
  @IsOptional()
  @IsUrl({}, { message: "올바른 URL 형식이 아닙니다." })
  @MaxLength(2048)
  linkUrl?: string;

  @ApiPropertyOptional({
    description: "노출 시작 시각 (ISO 8601, 미입력 시 즉시)",
  })
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiPropertyOptional({
    description: "노출 종료 시각 (ISO 8601, 미입력 시 무기한)",
  })
  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateHomeBannerDto {
  @ApiPropertyOptional({ example: SWAGGER_EXAMPLES.FILE_URL })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  imageUrl?: string;

  @ApiPropertyOptional({ enum: HomeBannerImageAlign })
  @IsOptional()
  @IsEnum(HomeBannerImageAlign)
  imageAlign?: HomeBannerImageAlign;

  @ApiPropertyOptional({ example: "https://picakes.com/event", nullable: true })
  @IsOptional()
  @IsUrl({}, { message: "올바른 URL 형식이 아닙니다." })
  @MaxLength(2048)
  linkUrl?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsDateString()
  startsAt?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsDateString()
  endsAt?: string | null;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ReorderHomeBannerDto {
  @ApiProperty({
    description: "정렬된 배너 ID 목록 (앞일수록 먼저 노출)",
    type: [String],
    example: ["clid1", "clid2"],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  orderedIds: string[];
}
