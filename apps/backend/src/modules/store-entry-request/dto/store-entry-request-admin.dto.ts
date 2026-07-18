import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";
import { StoreEntryRequestStatus } from "@apps/backend/infra/database/prisma/generated/client";
import { PaginationMetaResponseDto } from "@apps/backend/common/dto/pagination-response.dto";

/**
 * 관리자 입점 요청 목록 조회 쿼리 DTO
 */
export class AdminStoreEntryRequestListQueryDto {
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

  @ApiPropertyOptional({
    description: "검색어 (장소명·주소·연락처·카테고리 부분 일치)",
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  search?: string;
}

/** 입점 요청자(구매자) 요약 */
export class AdminStoreEntryRequestConsumerDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ description: "휴대폰 번호" })
  phone: string;

  @ApiProperty({ nullable: true })
  name: string | null;

  @ApiProperty({ nullable: true })
  nickname: string | null;
}

/**
 * 관리자 입점 요청 목록·상세 항목
 */
export class AdminStoreEntryRequestItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ description: "카카오 로컬 장소 ID" })
  kakaoPlaceId: string;

  @ApiProperty({ description: "장소명(스토어명)" })
  placeName: string;

  @ApiProperty({ nullable: true, description: "지번 주소" })
  address: string | null;

  @ApiProperty({ nullable: true, description: "도로명 주소" })
  roadAddress: string | null;

  @ApiProperty({ nullable: true, description: "전화번호" })
  phone: string | null;

  @ApiProperty({ nullable: true, description: "카카오 카테고리명" })
  categoryName: string | null;

  @ApiProperty({ nullable: true, description: "카카오 장소 URL" })
  placeUrl: string | null;

  @ApiProperty({ nullable: true, description: "위도" })
  latitude: number | null;

  @ApiProperty({ nullable: true, description: "경도" })
  longitude: number | null;

  @ApiProperty({ description: "처리 상태", enum: StoreEntryRequestStatus })
  status: StoreEntryRequestStatus;

  @ApiProperty({ description: "요청자", type: AdminStoreEntryRequestConsumerDto })
  consumer: AdminStoreEntryRequestConsumerDto;

  @ApiProperty({ description: "동일 장소(카카오 ID)에 대한 누적 요청 수" })
  samePlaceRequestCount: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

/**
 * 관리자 입점 요청 목록 응답
 */
export class AdminStoreEntryRequestListResponseDto {
  @ApiProperty({ type: [AdminStoreEntryRequestItemResponseDto] })
  data: AdminStoreEntryRequestItemResponseDto[];

  @ApiProperty({ type: PaginationMetaResponseDto })
  meta: PaginationMetaResponseDto;
}
