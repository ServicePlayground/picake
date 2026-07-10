import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsEnum } from "class-validator";
import { ReviewSortBy } from "@apps/backend/modules/review/constants/review.constants";
import { PaginationMetaResponseDto } from "@apps/backend/common/dto/pagination-response.dto";
import { PaginationRequestDto } from "@apps/backend/common/dto/pagination-request.dto";
import { MyReviewResponseDto } from "@apps/backend/modules/review/dto/review-detail.dto";

/**
 * 내가 작성한 후기 목록 조회 요청 DTO (페이지네이션)
 */
export class GetMyReviewsRequestDto extends PaginationRequestDto {
  @ApiProperty({
    description: "정렬",
    enum: ReviewSortBy,
    example: ReviewSortBy.LATEST,
  })
  @IsNotEmpty()
  @IsEnum(ReviewSortBy)
  sortBy: ReviewSortBy;
}

/**
 * 내가 작성한 후기 목록 조회 응답 DTO
 */
export class MyReviewListResponseDto {
  @ApiProperty({
    description: "후기 목록",
    type: [MyReviewResponseDto],
  })
  data: MyReviewResponseDto[];

  @ApiProperty({
    description: "페이지네이션 메타 정보",
    type: PaginationMetaResponseDto,
  })
  meta: PaginationMetaResponseDto;
}
