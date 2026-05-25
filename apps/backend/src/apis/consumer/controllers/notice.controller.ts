import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiExtraModels, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Auth } from "@apps/backend/modules/auth/decorators/auth.decorator";
import { SwaggerResponse } from "@apps/backend/common/decorators/swagger-response.decorator";
import { AUDIENCE } from "@apps/backend/modules/auth/constants/auth.constants";
import { NoticeService } from "@apps/backend/modules/notice/notice.service";
import { NoticeListResponseDto } from "@apps/backend/modules/notice/dto/notice.dto";

/**
 * 구매자 공지사항 컨트롤러
 */
@ApiTags("공지사항")
@ApiExtraModels(NoticeListResponseDto)
@Controller(`${AUDIENCE.CONSUMER}/notices`)
@Auth({ isPublic: true })
export class ConsumerNoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  /**
   * 공지사항 목록 조회 API
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "공지사항 목록 조회",
    description: "활성화된 공지사항을 핀 고정·등록일순으로 반환합니다. (비로그인 접근 가능)",
  })
  @SwaggerResponse(200, { dataDto: NoticeListResponseDto })
  async list() {
    return await this.noticeService.listActiveForConsumer();
  }
}
