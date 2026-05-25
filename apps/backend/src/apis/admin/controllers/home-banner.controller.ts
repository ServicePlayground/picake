import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { ApiExtraModels, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Auth } from "@apps/backend/modules/auth/decorators/auth.decorator";
import { SwaggerResponse } from "@apps/backend/common/decorators/swagger-response.decorator";
import { SwaggerAuthResponses } from "@apps/backend/common/decorators/swagger-auth-responses.decorator";
import { AUDIENCE } from "@apps/backend/modules/auth/constants/auth.constants";
import { HomeBannerService } from "@apps/backend/modules/home-banner/home-banner.service";
import {
  CreateHomeBannerDto,
  HomeBannerItemResponseDto,
  HomeBannerListResponseDto,
  ReorderHomeBannerDto,
  UpdateHomeBannerDto,
} from "@apps/backend/modules/home-banner/dto/home-banner.dto";

/**
 * 관리자 홈 배너 관리 컨트롤러
 */
@ApiTags("[관리자] 홈 배너")
@ApiExtraModels(
  HomeBannerItemResponseDto,
  HomeBannerListResponseDto,
  CreateHomeBannerDto,
  UpdateHomeBannerDto,
  ReorderHomeBannerDto,
)
@Controller(`${AUDIENCE.ADMIN}/home-banners`)
@Auth({ isPublic: false, audiences: [AUDIENCE.ADMIN] })
export class AdminHomeBannerController {
  constructor(private readonly homeBannerService: HomeBannerService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 홈 배너 목록 조회",
    description: "구매자 앱 홈 배너 전체 목록(비활성·예약·종료 포함)을 정렬 순으로 반환합니다.",
  })
  @SwaggerResponse(200, { dataDto: HomeBannerListResponseDto })
  @SwaggerAuthResponses()
  async list() {
    return await this.homeBannerService.listForAdmin();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "(로그인 필요) 홈 배너 등록" })
  @SwaggerResponse(201, { dataDto: HomeBannerItemResponseDto })
  @SwaggerAuthResponses()
  async create(@Body() dto: CreateHomeBannerDto) {
    return await this.homeBannerService.create(dto);
  }

  @Patch("reorder")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "(로그인 필요) 홈 배너 순서 변경" })
  @SwaggerResponse(200, { dataExample: { success: true } })
  @SwaggerAuthResponses()
  async reorder(@Body() dto: ReorderHomeBannerDto) {
    await this.homeBannerService.reorder(dto);
    return { success: true };
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "(로그인 필요) 홈 배너 수정" })
  @SwaggerResponse(200, { dataDto: HomeBannerItemResponseDto })
  @SwaggerAuthResponses()
  async update(@Param("id") id: string, @Body() dto: UpdateHomeBannerDto) {
    return await this.homeBannerService.update(id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "(로그인 필요) 홈 배너 삭제" })
  @SwaggerResponse(200, { dataExample: { success: true } })
  @SwaggerAuthResponses()
  async remove(@Param("id") id: string) {
    await this.homeBannerService.remove(id);
    return { success: true };
  }
}
