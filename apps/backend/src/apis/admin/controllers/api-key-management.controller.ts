import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Request,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiExtraModels } from "@nestjs/swagger";
import { Auth } from "@apps/backend/modules/auth/decorators/auth.decorator";
import { SwaggerResponse } from "@apps/backend/common/decorators/swagger-response.decorator";
import { SwaggerAuthResponses } from "@apps/backend/common/decorators/swagger-auth-responses.decorator";
import { AUDIENCE, AUTH_ERROR_MESSAGES } from "@apps/backend/modules/auth/constants/auth.constants";
import { AuthenticatedUser } from "@apps/backend/modules/auth/types/auth.types";
import { AdminApiKeyService } from "@apps/backend/modules/admin-api-key/services/admin-api-key.service";
import {
  AdminApiKeyCreatedResponseDto,
  AdminApiKeyItemResponseDto,
  AdminApiKeyListResponseDto,
  CreateAdminApiKeyDto,
} from "@apps/backend/modules/admin-api-key/dto/admin-api-key.dto";

/**
 * 관리자 API 키 관리 컨트롤러
 *
 * API 키 자체의 발급/폐기는 항상 사람 관리자 로그인(JWT)으로만 가능합니다 — API 키가 스스로
 * 다른 API 키를 발급하거나 폐기할 수 있게 하면(순환 상승) 유출 시 피해를 스스로 은폐할 수 있어
 * 모든 엔드포인트에서 `req.user.isApiKey`를 확인해 차단합니다.
 */
@ApiTags("[관리자] API 키 관리")
@ApiExtraModels(AdminApiKeyCreatedResponseDto, AdminApiKeyItemResponseDto, AdminApiKeyListResponseDto)
@Controller(`${AUDIENCE.ADMIN}/api-keys`)
@Auth({ isPublic: false, audiences: [AUDIENCE.ADMIN] })
export class AdminApiKeyManagementController {
  constructor(private readonly adminApiKeyService: AdminApiKeyService) {}

  private assertHumanAdmin(user: AuthenticatedUser) {
    if (user.isApiKey) {
      throw new ForbiddenException(AUTH_ERROR_MESSAGES.ADMIN_API_KEY_MANAGEMENT_HUMAN_ONLY);
    }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "(로그인 필요, 사람 계정 전용) 관리자 API 키 발급",
    description:
      "발급된 원문 키는 이 응답에서만 확인할 수 있고 서버에는 해시만 저장됩니다. 안전한 곳에 즉시 보관하세요.",
  })
  @SwaggerResponse(201, { dataDto: AdminApiKeyCreatedResponseDto })
  @SwaggerAuthResponses()
  async create(
    @Request() req: { user: AuthenticatedUser },
    @Body() dto: CreateAdminApiKeyDto,
  ) {
    this.assertHumanAdmin(req.user);
    return await this.adminApiKeyService.create(dto.label, req.user.id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "(로그인 필요, 사람 계정 전용) 관리자 API 키 목록 조회" })
  @SwaggerResponse(200, { dataDto: AdminApiKeyListResponseDto })
  @SwaggerAuthResponses()
  async list(@Request() req: { user: AuthenticatedUser }) {
    this.assertHumanAdmin(req.user);
    const data = await this.adminApiKeyService.list();
    return { data };
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요, 사람 계정 전용) 관리자 API 키 폐기",
    description: "즉시 비활성화됩니다. 삭제가 아니라 폐기이므로 이력은 남습니다.",
  })
  @SwaggerResponse(200, { dataExample: { message: "API 키가 폐기되었습니다." } })
  @SwaggerAuthResponses()
  async revoke(@Request() req: { user: AuthenticatedUser }, @Param("id") id: string) {
    this.assertHumanAdmin(req.user);
    await this.adminApiKeyService.revoke(id);
    return { message: "API 키가 폐기되었습니다." };
  }
}
