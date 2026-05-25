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
import { QnaService } from "@apps/backend/modules/qna/qna.service";
import {
  CreateQnaDto,
  QnaItemResponseDto,
  QnaListResponseDto,
  UpdateQnaDto,
} from "@apps/backend/modules/qna/dto/qna.dto";

/**
 * 관리자 Q&A 관리 컨트롤러
 */
@ApiTags("[관리자] Q&A")
@ApiExtraModels(QnaItemResponseDto, QnaListResponseDto, CreateQnaDto, UpdateQnaDto)
@Controller(`${AUDIENCE.ADMIN}/qnas`)
@Auth({ isPublic: false, audiences: [AUDIENCE.ADMIN] })
export class AdminQnaController {
  constructor(private readonly qnaService: QnaService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) Q&A 목록 조회",
    description: "Q&A 전체 목록(비활성 포함)을 카테고리·핀 고정·등록일순으로 반환합니다.",
  })
  @SwaggerResponse(200, { dataDto: QnaListResponseDto })
  @SwaggerAuthResponses()
  async list() {
    return await this.qnaService.listForAdmin();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "(로그인 필요) Q&A 등록" })
  @SwaggerResponse(201, { dataDto: QnaItemResponseDto })
  @SwaggerAuthResponses()
  async create(@Body() dto: CreateQnaDto) {
    return await this.qnaService.create(dto);
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "(로그인 필요) Q&A 수정" })
  @SwaggerResponse(200, { dataDto: QnaItemResponseDto })
  @SwaggerAuthResponses()
  async update(@Param("id") id: string, @Body() dto: UpdateQnaDto) {
    return await this.qnaService.update(id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "(로그인 필요) Q&A 삭제" })
  @SwaggerResponse(200, { dataExample: { success: true } })
  @SwaggerAuthResponses()
  async remove(@Param("id") id: string) {
    await this.qnaService.remove(id);
    return { success: true };
  }
}
