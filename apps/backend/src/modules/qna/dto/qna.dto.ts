import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class QnaItemResponseDto {
  @ApiProperty({ example: "clxxxxxxxxxxxxxxxx" })
  id: string;

  @ApiProperty({ example: "주문은 어떻게 하나요?" })
  question: string;

  @ApiProperty({
    example: "원하시는 상품을 선택한 후 예약하기 버튼을 눌러 예약을 진행하실 수 있습니다.",
  })
  answer: string;

  @ApiProperty({ description: "카테고리", example: "주문/예약" })
  category: string;

  @ApiProperty({ description: "핀 고정 여부", example: false })
  isPinned: boolean;

  @ApiProperty({ description: "노출 여부", example: true })
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class QnaListResponseDto {
  @ApiProperty({ type: [QnaItemResponseDto] })
  data: QnaItemResponseDto[];
}

export class QnaCategoryGroupDto {
  @ApiProperty({ example: "주문/예약" })
  category: string;

  @ApiProperty({ type: [QnaItemResponseDto] })
  items: QnaItemResponseDto[];
}

export class QnaGroupedListResponseDto {
  @ApiProperty({ type: [QnaCategoryGroupDto] })
  data: QnaCategoryGroupDto[];
}

export class CreateQnaDto {
  @ApiProperty({ example: "주문은 어떻게 하나요?" })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({
    example: "원하시는 상품을 선택한 후 예약하기 버튼을 눌러 예약을 진행하실 수 있습니다.",
  })
  @IsString()
  @IsNotEmpty()
  answer: string;

  @ApiPropertyOptional({ description: "카테고리", example: "주문/예약", default: "" })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: "핀 고정 여부", example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @ApiPropertyOptional({ description: "노출 여부", example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateQnaDto {
  @ApiPropertyOptional({ example: "주문은 어떻게 하나요?" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  question?: string;

  @ApiPropertyOptional({
    example: "원하시는 상품을 선택한 후 예약하기 버튼을 눌러 예약을 진행하실 수 있습니다.",
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  answer?: string;

  @ApiPropertyOptional({ description: "카테고리", example: "주문/예약" })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: "핀 고정 여부", example: false })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @ApiPropertyOptional({ description: "노출 여부", example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
