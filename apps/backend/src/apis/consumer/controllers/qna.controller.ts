import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiExtraModels, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Auth } from "@apps/backend/modules/auth/decorators/auth.decorator";
import { SwaggerResponse } from "@apps/backend/common/decorators/swagger-response.decorator";
import { AUDIENCE } from "@apps/backend/modules/auth/constants/auth.constants";
import { QnaService } from "@apps/backend/modules/qna/qna.service";
import { QnaGroupedListResponseDto } from "@apps/backend/modules/qna/dto/qna.dto";

/**
 * 구매자 Q&A 컨트롤러
 */
@ApiTags("Q&A")
@ApiExtraModels(QnaGroupedListResponseDto)
@Controller(`${AUDIENCE.CONSUMER}/qnas`)
@Auth({ isPublic: true })
export class ConsumerQnaController {
  constructor(private readonly qnaService: QnaService) {}

  /**
   * Q&A 목록 조회 API (카테고리별 그룹)
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Q&A 목록 조회 (카테고리별 그룹)",
    description:
      "활성화된 Q&A를 카테고리별로 그룹핑하여 반환합니다. 각 그룹 내 핀 고정·등록일순입니다. (비로그인 접근 가능)",
  })
  @SwaggerResponse(200, { dataDto: QnaGroupedListResponseDto })
  async list() {
    return await this.qnaService.listGroupedForConsumer();
  }
}
