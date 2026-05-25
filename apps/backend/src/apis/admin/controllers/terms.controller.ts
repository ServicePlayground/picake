import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ApiExtraModels, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Auth } from "@apps/backend/modules/auth/decorators/auth.decorator";
import { SwaggerResponse } from "@apps/backend/common/decorators/swagger-response.decorator";
import { SwaggerAuthResponses } from "@apps/backend/common/decorators/swagger-auth-responses.decorator";
import { AUDIENCE } from "@apps/backend/modules/auth/constants/auth.constants";
import { TermsService } from "@apps/backend/modules/terms/terms.service";
import { TermsType } from "@apps/backend/infra/database/prisma/generated/client";
import {
  CreateTermsDocumentDto,
  TermsActiveMapResponseDto,
  TermsDocumentResponseDto,
  TermsVersionListResponseDto,
} from "@apps/backend/modules/terms/dto/terms.dto";
import { TERMS_ERROR_MESSAGES } from "@apps/backend/modules/terms/constants/terms.constants";
import { createMessageObject } from "@apps/backend/common/utils/message.util";

/**
 * 관리자 약관 관리 컨트롤러
 */
@ApiTags("[관리자] 약관")
@ApiExtraModels(
  TermsDocumentResponseDto,
  TermsActiveMapResponseDto,
  TermsVersionListResponseDto,
  CreateTermsDocumentDto,
)
@Controller(`${AUDIENCE.ADMIN}/terms`)
@Auth({ isPublic: false, audiences: [AUDIENCE.ADMIN] })
export class AdminTermsController {
  constructor(private readonly termsService: TermsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 약관 활성 버전 목록 조회",
    description: "각 약관 타입의 현재 활성 버전을 한눈에 확인합니다.",
  })
  @SwaggerResponse(200, { dataDto: TermsActiveMapResponseDto })
  @SwaggerAuthResponses()
  async list() {
    return await this.termsService.listActiveForAdmin();
  }

  @Get("versions")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 약관 버전 이력 목록 조회",
    description: "?type=CONSUMER_TERMS_OF_SERVICE 처럼 쿼리로 타입을 지정합니다.",
  })
  @ApiQuery({ name: "type", enum: TermsType })
  @SwaggerResponse(200, { dataDto: TermsVersionListResponseDto })
  @SwaggerAuthResponses()
  async listVersions(@Query("type") type: TermsType) {
    return await this.termsService.listVersionsByType(type);
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 약관 상세 조회",
    description: "약관 문서 ID로 상세 내용(content 포함)을 조회합니다.",
  })
  @SwaggerResponse(200, { dataDto: TermsDocumentResponseDto })
  @SwaggerResponse(404, { dataExample: createMessageObject(TERMS_ERROR_MESSAGES.NOT_FOUND) })
  @SwaggerAuthResponses()
  async findById(@Param("id") id: string) {
    return await this.termsService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "(로그인 필요) 약관 버전 등록",
    description:
      "약관은 수정 없이 항상 새 버전으로만 등록합니다. activateNow=true면 즉시 활성 버전으로 지정됩니다.",
  })
  @SwaggerResponse(201, { dataDto: TermsDocumentResponseDto })
  @SwaggerAuthResponses()
  async create(@Body() dto: CreateTermsDocumentDto) {
    return await this.termsService.create(dto);
  }

  @Patch(":id/activate")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 약관 버전 활성화",
    description: "해당 타입의 기존 활성 버전이 자동으로 비활성화되고 이 버전이 활성화됩니다.",
  })
  @SwaggerResponse(200, { dataDto: TermsDocumentResponseDto })
  @SwaggerResponse(404, { dataExample: createMessageObject(TERMS_ERROR_MESSAGES.NOT_FOUND) })
  @SwaggerAuthResponses()
  async activate(@Param("id") id: string) {
    return await this.termsService.activate(id);
  }
}
