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
import { NoticeService } from "@apps/backend/modules/notice/notice.service";
import {
  CreateNoticeDto,
  NoticeItemResponseDto,
  NoticeListResponseDto,
  UpdateNoticeDto,
} from "@apps/backend/modules/notice/dto/notice.dto";

/**
 * 관리자 공지사항 관리 컨트롤러
 */
@ApiTags("[관리자] 공지사항")
@ApiExtraModels(NoticeItemResponseDto, NoticeListResponseDto, CreateNoticeDto, UpdateNoticeDto)
@Controller(`${AUDIENCE.ADMIN}/notices`)
@Auth({ isPublic: false, audiences: [AUDIENCE.ADMIN] })
export class AdminNoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 공지사항 목록 조회",
    description: "공지사항 전체 목록(비활성 포함)을 핀 고정·등록일순으로 반환합니다.",
  })
  @SwaggerResponse(200, { dataDto: NoticeListResponseDto })
  @SwaggerAuthResponses()
  async list() {
    return await this.noticeService.listForAdmin();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "(로그인 필요) 공지사항 등록" })
  @SwaggerResponse(201, { dataDto: NoticeItemResponseDto })
  @SwaggerAuthResponses()
  async create(@Body() dto: CreateNoticeDto) {
    return await this.noticeService.create(dto);
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "(로그인 필요) 공지사항 수정" })
  @SwaggerResponse(200, { dataDto: NoticeItemResponseDto })
  @SwaggerAuthResponses()
  async update(@Param("id") id: string, @Body() dto: UpdateNoticeDto) {
    return await this.noticeService.update(id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "(로그인 필요) 공지사항 삭제" })
  @SwaggerResponse(200, { dataExample: { success: true } })
  @SwaggerAuthResponses()
  async remove(@Param("id") id: string) {
    await this.noticeService.remove(id);
    return { success: true };
  }
}
