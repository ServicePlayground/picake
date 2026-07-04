import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Request } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiExtraModels } from "@nestjs/swagger";
import { StoreEntryRequestService } from "@apps/backend/modules/store-entry-request/store-entry-request.service";
import { Auth } from "@apps/backend/modules/auth/decorators/auth.decorator";
import { SwaggerResponse } from "@apps/backend/common/decorators/swagger-response.decorator";
import { SwaggerAuthResponses } from "@apps/backend/common/decorators/swagger-auth-responses.decorator";
import { createMessageObject } from "@apps/backend/common/utils/message.util";
import { JwtVerifiedPayload } from "@apps/backend/modules/auth/types/auth.types";
import { AUDIENCE } from "@apps/backend/modules/auth/constants/auth.constants";
import {
  STORE_ENTRY_REQUEST_ERROR_MESSAGES,
  STORE_ENTRY_REQUEST_SUCCESS_MESSAGES,
} from "@apps/backend/modules/store-entry-request/constants/store-entry-request.constants";
import {
  CreateStoreEntryRequestDto,
  CreateStoreEntryRequestResponseDto,
  StoreEntryRequestExistsQueryDto,
  StoreEntryRequestExistsResponseDto,
} from "@apps/backend/modules/store-entry-request/dto/store-entry-request.dto";

/**
 * 입점 요청 컨트롤러 (사용자용)
 * 지도에서 미입점 스토어(카카오 장소)에 대한 입점 요청을 처리합니다.
 */
@ApiTags("입점 요청")
@ApiExtraModels(CreateStoreEntryRequestResponseDto, StoreEntryRequestExistsResponseDto)
@Controller(`${AUDIENCE.CONSUMER}/store-entry-requests`)
@Auth({ isPublic: false, audiences: ["consumer"] })
export class ConsumerStoreEntryRequestController {
  constructor(private readonly storeEntryRequestService: StoreEntryRequestService) {}

  /**
   * 입점 요청 추가 API
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "(로그인 필요) 입점 요청 추가",
    description:
      "미입점 스토어(카카오 장소)에 대한 입점 요청을 등록합니다. 동일 장소 중복 요청은 불가합니다.",
  })
  @SwaggerResponse(201, { dataDto: CreateStoreEntryRequestResponseDto })
  @SwaggerAuthResponses()
  @SwaggerResponse(409, {
    dataExample: createMessageObject(STORE_ENTRY_REQUEST_ERROR_MESSAGES.ALREADY_EXISTS),
  })
  async create(
    @Body() dto: CreateStoreEntryRequestDto,
    @Request() req: { user: JwtVerifiedPayload },
  ) {
    await this.storeEntryRequestService.createForUser(req.user.sub, dto);
    return { message: STORE_ENTRY_REQUEST_SUCCESS_MESSAGES.CREATED };
  }

  /**
   * 입점 요청 존재 여부 조회 API (버튼 상태 표시용)
   */
  @Get("exists")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 입점 요청 존재 여부 조회",
    description: "현재 로그인 사용자가 해당 카카오 장소에 이미 입점 요청했는지 여부를 반환합니다.",
  })
  @SwaggerResponse(200, { dataDto: StoreEntryRequestExistsResponseDto })
  @SwaggerAuthResponses()
  async exists(
    @Query() query: StoreEntryRequestExistsQueryDto,
    @Request() req: { user: JwtVerifiedPayload },
  ): Promise<StoreEntryRequestExistsResponseDto> {
    return await this.storeEntryRequestService.existsForUser(req.user.sub, query.kakaoPlaceId);
  }
}
