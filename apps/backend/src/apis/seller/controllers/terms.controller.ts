import { Controller, Get, HttpCode, HttpStatus, Param } from "@nestjs/common";
import { ApiExtraModels, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { Auth } from "@apps/backend/modules/auth/decorators/auth.decorator";
import { SwaggerResponse } from "@apps/backend/common/decorators/swagger-response.decorator";
import { createMessageObject } from "@apps/backend/common/utils/message.util";
import { AUDIENCE } from "@apps/backend/modules/auth/constants/auth.constants";
import { TermsService } from "@apps/backend/modules/terms/terms.service";
import { TermsType } from "@apps/backend/infra/database/prisma/generated/client";
import { TermsDocumentResponseDto } from "@apps/backend/modules/terms/dto/terms.dto";
import {
  SELLER_TERMS_TYPES,
  TERMS_ERROR_MESSAGES,
} from "@apps/backend/modules/terms/constants/terms.constants";

/**
 * 판매자 약관 컨트롤러
 */
@ApiTags("약관")
@ApiExtraModels(TermsDocumentResponseDto)
@Controller(`${AUDIENCE.SELLER}/terms`)
@Auth({ isPublic: true })
export class SellerTermsController {
  constructor(private readonly termsService: TermsService) {}

  /**
   * 활성 약관 조회 API
   */
  @Get(":type")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "활성 약관 조회",
    description: "약관 타입별 현재 활성 버전의 HTML 내용을 반환합니다. (비로그인 접근 가능)",
  })
  @ApiParam({ name: "type", enum: SELLER_TERMS_TYPES })
  @SwaggerResponse(200, { dataDto: TermsDocumentResponseDto })
  @SwaggerResponse(404, {
    dataExample: createMessageObject(TERMS_ERROR_MESSAGES.ACTIVE_NOT_FOUND),
  })
  async getActive(@Param("type") type: TermsType) {
    return await this.termsService.getActiveByType(type);
  }
}
