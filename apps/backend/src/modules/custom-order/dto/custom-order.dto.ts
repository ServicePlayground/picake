import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  IsArray,
  IsDateString,
  MaxLength,
  ArrayMaxSize,
} from "class-validator";

/** 커스텀 주문 요청 생성 (구매자) */
export class CreateCustomOrderRequestDto {
  @ApiProperty({ description: "상품 ID (CUSTOM_CAKE && requiresQuote=true인 상품만)" })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiPropertyOptional({ description: "참고 이미지 URL 목록", type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({ description: "원하는 문구/디자인 설명", example: "생일 축하 문구, 파스텔톤" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  requirementsText: string;

  @ApiPropertyOptional({ description: "수량", example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional({ description: "예산 최소 (참고용)", example: 50000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  desiredBudgetMin?: number;

  @ApiPropertyOptional({ description: "예산 최대 (참고용)", example: 80000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  desiredBudgetMax?: number;

  @ApiProperty({
    description: "희망 픽업 일시 (날짜+시간 필수, 매장 영업시간 내)",
    example: "2026-08-15T14:00:00.000Z",
  })
  @IsDateString()
  desiredDate: string;

  @ApiPropertyOptional({ description: "픽업 연락처 이름" })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  reservationContactName?: string;

  @ApiPropertyOptional({ description: "픽업 연락처 (입금 안내 알림톡 수신번호)" })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  reservationPhone?: string;
}

/** 견적 제시 (판매자) */
export class QuoteCustomOrderRequestDto {
  @ApiProperty({ description: "견적가", example: 65000 })
  @IsInt()
  @Min(0)
  quotedPrice: number;

  @ApiPropertyOptional({ description: "견적 코멘트", example: "사이즈 1호 기준입니다" })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  sellerNote?: string;
}
