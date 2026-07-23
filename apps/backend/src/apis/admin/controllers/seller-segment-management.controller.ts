import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { ApiExtraModels, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Auth } from "@apps/backend/modules/auth/decorators/auth.decorator";
import { SwaggerResponse } from "@apps/backend/common/decorators/swagger-response.decorator";
import { SwaggerAuthResponses } from "@apps/backend/common/decorators/swagger-auth-responses.decorator";
import { createMessageObject } from "@apps/backend/common/utils/message.util";
import { AUDIENCE } from "@apps/backend/modules/auth/constants/auth.constants";
import { SELLER_SEGMENT_ERROR_MESSAGES } from "@apps/backend/modules/seller-segment/constants/seller-segment.constants";
import {
  AutoAssignBySignupDateDto,
  AutoAssignResultResponseDto,
  CreateSellerSegmentDto,
  SellerSegmentListResponseDto,
  SellerSegmentResponseDto,
} from "@apps/backend/modules/seller-segment/dto/seller-segment.dto";
import { SellerSegmentService } from "@apps/backend/modules/seller-segment/seller-segment.service";

/**
 * 판매자 세그먼트 관리 컨트롤러 (관리자)
 *
 * "오픈 초기 가입 판매자"처럼 향후 혜택을 줄 대상을 미리 구분해두기 위한 기능입니다.
 * 혜택의 종류·인원·기간은 여기서 다루지 않고, 세그먼트 소속 여부만 관리합니다.
 */
@ApiTags("[관리자] 판매자 세그먼트")
@ApiExtraModels(SellerSegmentResponseDto, SellerSegmentListResponseDto, AutoAssignResultResponseDto)
@Controller(`${AUDIENCE.ADMIN}/seller-segment-management`)
@Auth({ isPublic: false, audiences: [AUDIENCE.ADMIN] })
export class AdminSellerSegmentManagementController {
  constructor(private readonly sellerSegmentService: SellerSegmentService) {}

  @Get("segments")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 세그먼트 목록 조회",
    description: "등록된 판매자 세그먼트 전체 목록과 각 소속 판매자 수를 반환합니다.",
  })
  @SwaggerResponse(200, { dataDto: SellerSegmentListResponseDto })
  @SwaggerAuthResponses()
  async list() {
    return await this.sellerSegmentService.list();
  }

  @Post("segments")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "(로그인 필요) 세그먼트 등록",
    description:
      "혜택 내용이 정해지지 않아도 먼저 '누구를 구분해둘지' 그룹만 만들어둘 수 있습니다. 예: EARLY_BIRD_2026 / 오픈 초기 가입 판매자.",
  })
  @SwaggerResponse(201, { dataDto: SellerSegmentResponseDto })
  @SwaggerResponse(400, {
    dataExample: createMessageObject(SELLER_SEGMENT_ERROR_MESSAGES.KEY_DUPLICATE),
  })
  @SwaggerAuthResponses()
  async create(@Body() dto: CreateSellerSegmentDto) {
    return await this.sellerSegmentService.create(dto);
  }

  @Post("segments/:id/auto-assign-by-signup-date")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 가입일 기준 자동 편입",
    description:
      "cutoffDate 이전(포함) 가입한 판매자를 이 세그먼트에 편입합니다. 이미 편입된 판매자는 건너뛰므로 " +
      "여러 번 실행해도 안전합니다. 기준일은 정책이 정해질 때마다 원하는 값으로 지정하세요.",
  })
  @SwaggerResponse(200, { dataDto: AutoAssignResultResponseDto })
  @SwaggerResponse(404, {
    dataExample: createMessageObject(SELLER_SEGMENT_ERROR_MESSAGES.SEGMENT_NOT_FOUND),
  })
  @SwaggerAuthResponses()
  async autoAssignBySignupDate(@Param("id") id: string, @Body() dto: AutoAssignBySignupDateDto) {
    return await this.sellerSegmentService.autoAssignBySignupDate(id, dto);
  }
}
