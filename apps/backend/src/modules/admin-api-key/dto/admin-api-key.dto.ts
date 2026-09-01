import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength, MinLength } from "class-validator";

/**
 * 관리자 API 키 발급 요청 DTO
 */
export class CreateAdminApiKeyDto {
  @ApiProperty({
    description: "이 키의 용도를 식별하기 위한 이름 (예: '일일 데이터 리포트 자동화')",
    example: "일일 데이터 리포트 자동화",
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  label: string;
}

/**
 * 관리자 API 키 발급 응답 DTO — 원문 키는 이 응답에서만 1회 노출되고 이후 다시 조회할 수 없음
 */
export class AdminApiKeyCreatedResponseDto {
  @ApiProperty({ description: "API 키 id", example: "clxxxxapikey" })
  id: string;

  @ApiProperty({ example: "일일 데이터 리포트 자동화" })
  label: string;

  @ApiProperty({
    description: "발급된 API 키 원문 — 지금 이 응답에서만 확인 가능하며 서버에는 해시만 저장됩니다. 안전한 곳에 즉시 보관하세요.",
    example: "admk_9f8c2a1b3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5061728394a5b6c7d8",
  })
  apiKey: string;

  @ApiProperty()
  createdAt: Date;
}

/**
 * 관리자 API 키 목록 항목 응답 DTO — 원문 키는 절대 포함하지 않음
 */
export class AdminApiKeyItemResponseDto {
  @ApiProperty({ example: "clxxxxapikey" })
  id: string;

  @ApiProperty({ example: "일일 데이터 리포트 자동화" })
  label: string;

  @ApiProperty({
    description: "원문 식별용 접두어 (전체 키가 아님)",
    example: "admk_9f8c2a1b",
  })
  keyPrefix: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ nullable: true })
  lastUsedAt: Date | null;

  @ApiProperty({ nullable: true, description: "발급한 관리자 계정 id" })
  createdByAdminId: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ nullable: true })
  revokedAt: Date | null;
}

/**
 * 관리자 API 키 목록 응답 DTO
 */
export class AdminApiKeyListResponseDto {
  @ApiProperty({ type: [AdminApiKeyItemResponseDto] })
  data: AdminApiKeyItemResponseDto[];
}
