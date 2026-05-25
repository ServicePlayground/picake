import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiExtraModels, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Auth } from "@apps/backend/modules/auth/decorators/auth.decorator";
import { SwaggerResponse } from "@apps/backend/common/decorators/swagger-response.decorator";
import { AUDIENCE } from "@apps/backend/modules/auth/constants/auth.constants";
import { HomeBannerService } from "@apps/backend/modules/home-banner/home-banner.service";
import { HomeBannerListResponseDto } from "@apps/backend/modules/home-banner/dto/home-banner.dto";

/**
 * 구매자 홈 배너 컨트롤러
 */
@ApiTags("홈 배너")
@ApiExtraModels(HomeBannerListResponseDto)
@Controller(`${AUDIENCE.CONSUMER}/home-banners`)
@Auth({ isPublic: true })
export class ConsumerHomeBannerController {
  constructor(private readonly homeBannerService: HomeBannerService) {}

  /**
   * 홈 배너 목록 조회 API
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "홈 배너 목록 조회",
    description:
      "구매자 앱 홈에 노출 중인 배너만 정렬 순으로 반환합니다. (비로그인 접근 가능)",
  })
  @SwaggerResponse(200, { dataDto: HomeBannerListResponseDto })
  async list() {
    return await this.homeBannerService.listActiveForConsumer();
  }
}
