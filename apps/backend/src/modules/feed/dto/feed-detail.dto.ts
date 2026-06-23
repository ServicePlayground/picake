import { ApiProperty } from "@nestjs/swagger";
import { SWAGGER_EXAMPLES as STORE_SWAGGER_EXAMPLES } from "@apps/backend/modules/store/constants/store.constants";
import { SWAGGER_EXAMPLES as UPLOAD_SWAGGER_EXAMPLES } from "@apps/backend/modules/upload/constants/upload.constants";
import { SWAGGER_EXAMPLES } from "@apps/backend/modules/feed/constants/feed.constants";

/**
 * 피드 응답 DTO
 */
export class FeedResponseDto {
  @ApiProperty({
    description: "피드 ID",
    example: STORE_SWAGGER_EXAMPLES.ID,
  })
  id: string;

  @ApiProperty({
    description: "스토어 ID",
    example: STORE_SWAGGER_EXAMPLES.ID,
  })
  storeId: string;

  @ApiProperty({
    description: "피드 제목",
    example: SWAGGER_EXAMPLES.TITLE,
  })
  title: string;

  @ApiProperty({
    description: "피드 내용 (텍스트)",
    example: SWAGGER_EXAMPLES.CONTENT,
  })
  content: string;

  @ApiProperty({
    description: "피드 이미지 URL 목록",
    type: [String],
    example: SWAGGER_EXAMPLES.IMAGE_URLS,
  })
  imageUrls: string[];

  @ApiProperty({
    description: "스토어 로고 이미지 URL",
    example: UPLOAD_SWAGGER_EXAMPLES.FILE_URL,
  })
  storeLogoImageUrl: string | null;

  @ApiProperty({
    description: "작성 날짜",
    example: STORE_SWAGGER_EXAMPLES.CREATED_AT,
  })
  createdAt: Date;

  @ApiProperty({
    description: "수정 날짜",
    example: STORE_SWAGGER_EXAMPLES.CREATED_AT,
  })
  updatedAt: Date;
}
