import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import {
  FEED_MAX_IMAGES,
  SWAGGER_EXAMPLES,
} from "@apps/backend/modules/feed/constants/feed.constants";
import { SWAGGER_EXAMPLES as STORE_SWAGGER_EXAMPLES } from "@apps/backend/modules/store/constants/store.constants";

/**
 * 피드 수정 요청 DTO
 */
export class UpdateFeedRequestDto {
  @ApiProperty({
    description: "피드 제목",
    example: SWAGGER_EXAMPLES.TITLE,
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: "피드 내용 (텍스트)",
    example: SWAGGER_EXAMPLES.CONTENT,
  })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiPropertyOptional({
    description: `피드 이미지 URL 목록 (선택, 최대 ${FEED_MAX_IMAGES}장)`,
    type: [String],
    example: SWAGGER_EXAMPLES.IMAGE_URLS,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(FEED_MAX_IMAGES)
  @IsString({ each: true })
  @MaxLength(2048, { each: true })
  imageUrls?: string[];
}

/**
 * 피드 수정 응답 DTO
 */
export class UpdateFeedResponseDto {
  @ApiProperty({
    description: "피드 ID",
    example: STORE_SWAGGER_EXAMPLES.ID,
  })
  id: string;
}
