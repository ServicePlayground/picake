import { Controller, Get, HttpCode, HttpStatus, Param, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiExtraModels } from "@nestjs/swagger";
import { Auth } from "@apps/backend/modules/auth/decorators/auth.decorator";
import { SwaggerResponse } from "@apps/backend/common/decorators/swagger-response.decorator";
import { SwaggerAuthResponses } from "@apps/backend/common/decorators/swagger-auth-responses.decorator";
import { PaginationMetaResponseDto } from "@apps/backend/common/dto/pagination-response.dto";
import { createMessageObject } from "@apps/backend/common/utils/message.util";
import { AUDIENCE } from "@apps/backend/modules/auth/constants/auth.constants";
import { STORE_ENTRY_REQUEST_ERROR_MESSAGES } from "@apps/backend/modules/store-entry-request/constants/store-entry-request.constants";
import {
  AdminStoreEntryRequestConsumerDto,
  AdminStoreEntryRequestItemResponseDto,
  AdminStoreEntryRequestListQueryDto,
  AdminStoreEntryRequestListResponseDto,
} from "@apps/backend/modules/store-entry-request/dto/store-entry-request-admin.dto";
import { StoreEntryRequestService } from "@apps/backend/modules/store-entry-request/store-entry-request.service";

/**
 * 입점 요청 관리 컨트롤러 (관리자)
 */
@ApiTags("[관리자] 입점 요청")
@ApiExtraModels(
  AdminStoreEntryRequestItemResponseDto,
  AdminStoreEntryRequestListResponseDto,
  AdminStoreEntryRequestConsumerDto,
  PaginationMetaResponseDto,
)
@Controller(`${AUDIENCE.ADMIN}/store-entry-request-management`)
@Auth({ isPublic: false, audiences: [AUDIENCE.ADMIN] })
export class AdminStoreEntryRequestManagementController {
  constructor(private readonly storeEntryRequestService: StoreEntryRequestService) {}

  @Get("requests")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 입점 요청 목록 조회",
    description:
      "검색어(장소명·주소·연락처·카테고리)로 입점 요청을 조회합니다. 최신 요청순, 요청자·동일 장소 누적 요청 수 포함.",
  })
  @SwaggerResponse(200, { dataDto: AdminStoreEntryRequestListResponseDto })
  @SwaggerAuthResponses()
  async listRequests(@Query() query: AdminStoreEntryRequestListQueryDto) {
    return await this.storeEntryRequestService.listForAdmin(query);
  }

  @Get("requests/:id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 입점 요청 상세 조회",
    description: "요청 장소 스냅샷·요청자 정보와 동일 장소 누적 요청 수를 반환합니다.",
  })
  @SwaggerResponse(200, { dataDto: AdminStoreEntryRequestItemResponseDto })
  @SwaggerAuthResponses()
  @SwaggerResponse(404, {
    dataExample: createMessageObject(STORE_ENTRY_REQUEST_ERROR_MESSAGES.NOT_FOUND),
  })
  async getRequest(@Param("id") id: string) {
    return await this.storeEntryRequestService.getByIdForAdmin(id);
  }
}
