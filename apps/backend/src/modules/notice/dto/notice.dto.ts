import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class NoticeItemResponseDto {
  @ApiProperty({ example: "clxxxxxxxxxxxxxxxx" })
  id: string;

  @ApiProperty({ example: "서비스 점검 안내" })
  title: string;

  @ApiProperty({ example: "안녕하세요. 스윗오더입니다.\n서비스 점검이 예정되어 있습니다." })
  content: string;

  @ApiProperty({ description: "핀 고정 여부", example: false })
  isPinned: boolean;

  @ApiProperty({ description: "노출 여부", example: true })
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class NoticeListResponseDto {
  @ApiProperty({ type: [NoticeItemResponseDto] })
  data: NoticeItemResponseDto[];
}

export class CreateNoticeDto {
  @ApiProperty({ example: "서비스 점검 안내" })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: "안녕하세요. 스윗오더입니다.\n서비스 점검이 예정되어 있습니다." })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ description: "핀 고정 여부", example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @ApiPropertyOptional({ description: "노출 여부", example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateNoticeDto {
  @ApiPropertyOptional({ example: "서비스 점검 안내" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ApiPropertyOptional({ example: "안녕하세요. 스윗오더입니다." })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  content?: string;

  @ApiPropertyOptional({ description: "핀 고정 여부", example: false })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @ApiPropertyOptional({ description: "노출 여부", example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
