import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { StoreEntryRequestStatus } from "@apps/backend/infra/database/prisma/generated/client";
import { STORE_ENTRY_REQUEST_SUCCESS_MESSAGES } from "@apps/backend/modules/store-entry-request/constants/store-entry-request.constants";

/**
 * 입점 요청 생성 요청 DTO
 * 카카오 로컬(키워드 검색) 장소 정보를 스냅샷으로 저장한다.
 */
export class CreateStoreEntryRequestDto {
  @ApiProperty({ description: "카카오 로컬 장소 ID", example: "26338954" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  kakaoPlaceId: string;

  @ApiProperty({ description: "장소명", example: "산세바스티안 미입점" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  placeName: string;

  @ApiPropertyOptional({ description: "지번 주소", example: "서울 강남구 역삼동 123-45" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional({ description: "도로명 주소", example: "서울 강남구 테헤란로 123" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  roadAddress?: string;

  @ApiPropertyOptional({ description: "전화번호", example: "02-123-4567" })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional({
    description: "카카오 카테고리명",
    example: "음식점 > 카페 > 제과,베이커리",
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  categoryName?: string;

  @ApiPropertyOptional({
    description: "카카오 장소 상세 URL",
    example: "http://place.map.kakao.com/26338954",
  })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  placeUrl?: string;

  @ApiPropertyOptional({ description: "위도", example: 37.5012 })
  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @ApiPropertyOptional({ description: "경도", example: 127.0396 })
  @IsOptional()
  @IsLongitude()
  longitude?: number;
}

/**
 * 입점 요청 존재 여부 조회 쿼리 DTO
 */
export class StoreEntryRequestExistsQueryDto {
  @ApiProperty({ description: "카카오 로컬 장소 ID", example: "26338954" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  kakaoPlaceId: string;
}

/**
 * 입점 요청 생성 응답 DTO
 */
export class CreateStoreEntryRequestResponseDto {
  @ApiProperty({
    description: "응답 메시지",
    example: STORE_ENTRY_REQUEST_SUCCESS_MESSAGES.CREATED,
  })
  message: string;
}

/**
 * 입점 요청 존재 여부 응답 DTO (현재 로그인 사용자 기준)
 */
export class StoreEntryRequestExistsResponseDto {
  @ApiProperty({ description: "현재 사용자의 입점 요청 존재 여부", example: true })
  requested: boolean;
}

/**
 * 입점 요청 단건 응답 DTO
 */
export class StoreEntryRequestResponseDto {
  @ApiProperty({ example: "clxxxxxxxxxxxxxxxx" })
  id: string;

  @ApiProperty({ example: "26338954" })
  kakaoPlaceId: string;

  @ApiProperty({ example: "산세바스티안 미입점" })
  placeName: string;

  @ApiPropertyOptional({ example: "서울 강남구 역삼동 123-45" })
  address: string | null;

  @ApiPropertyOptional({ example: "서울 강남구 테헤란로 123" })
  roadAddress: string | null;

  @ApiPropertyOptional({ example: "02-123-4567" })
  phone: string | null;

  @ApiPropertyOptional({ example: "음식점 > 카페 > 제과,베이커리" })
  categoryName: string | null;

  @ApiPropertyOptional({ example: "http://place.map.kakao.com/26338954" })
  placeUrl: string | null;

  @ApiPropertyOptional({ example: 37.5012 })
  latitude: number | null;

  @ApiPropertyOptional({ example: 127.0396 })
  longitude: number | null;

  @ApiProperty({ enum: StoreEntryRequestStatus, example: StoreEntryRequestStatus.REQUESTED })
  status: StoreEntryRequestStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
