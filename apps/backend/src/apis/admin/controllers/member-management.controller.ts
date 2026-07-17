import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiExtraModels } from "@nestjs/swagger";
import { Auth } from "@apps/backend/modules/auth/decorators/auth.decorator";
import { SwaggerResponse } from "@apps/backend/common/decorators/swagger-response.decorator";
import { SwaggerAuthResponses } from "@apps/backend/common/decorators/swagger-auth-responses.decorator";
import { PaginationMetaResponseDto } from "@apps/backend/common/dto/pagination-response.dto";
import { createMessageObject } from "@apps/backend/common/utils/message.util";
import { AUDIENCE } from "@apps/backend/modules/auth/constants/auth.constants";
import { MEMBER_MANAGEMENT_ERROR_MESSAGES } from "@apps/backend/modules/member-management/constants/member-management.constants";
import { UpdateMemberActiveDto } from "@apps/backend/modules/member-management/dto/member-management-common.dto";
import {
  MemberConsumerItemResponseDto,
  MemberConsumerListQueryDto,
  MemberConsumerListResponseDto,
} from "@apps/backend/modules/member-management/dto/member-management-consumer.dto";
import {
  MemberSellerItemResponseDto,
  MemberSellerListQueryDto,
  MemberSellerListResponseDto,
} from "@apps/backend/modules/member-management/dto/member-management-seller.dto";
import { MemberManagementService } from "@apps/backend/modules/member-management/services/member-management.service";

/**
 * 회원(구매자·판매자) 관리 컨트롤러
 */
@ApiTags("[관리자] 회원 관리")
@ApiExtraModels(
  MemberConsumerItemResponseDto,
  MemberConsumerListResponseDto,
  MemberSellerItemResponseDto,
  MemberSellerListResponseDto,
  PaginationMetaResponseDto,
  UpdateMemberActiveDto,
)
@Controller(`${AUDIENCE.ADMIN}/member-management`)
@Auth({ isPublic: false, audiences: [AUDIENCE.ADMIN] })
export class AdminMemberManagementController {
  constructor(private readonly memberManagementService: MemberManagementService) {}

  @Get("consumers")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 구매자 목록 조회",
    description:
      "검색어(이름·닉네임·휴대폰 부분 일치)와 상태(ACTIVE/INACTIVE/WITHDRAWN) 필터로 구매자를 조회합니다. 최신 가입순, 누적 주문 수 포함.",
  })
  @SwaggerResponse(200, { dataDto: MemberConsumerListResponseDto })
  @SwaggerAuthResponses()
  async listConsumers(@Query() query: MemberConsumerListQueryDto) {
    return await this.memberManagementService.listConsumers(query);
  }

  @Patch("consumers/:id/active")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 구매자 계정 활성/비활성 변경",
    description: "isActive: false면 계정 이용이 제한됩니다. 탈퇴한 회원은 변경할 수 없습니다.",
  })
  @SwaggerResponse(200, { dataDto: MemberConsumerItemResponseDto })
  @SwaggerAuthResponses()
  @SwaggerResponse(400, {
    dataExample: createMessageObject(MEMBER_MANAGEMENT_ERROR_MESSAGES.MEMBER_WITHDRAWN),
  })
  @SwaggerResponse(404, {
    dataExample: createMessageObject(MEMBER_MANAGEMENT_ERROR_MESSAGES.CONSUMER_NOT_FOUND),
  })
  async updateConsumerActive(@Param("id") id: string, @Body() dto: UpdateMemberActiveDto) {
    return await this.memberManagementService.updateConsumerActive(id, dto);
  }

  @Get("sellers")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 판매자 목록 조회",
    description:
      "검색어(이름·닉네임·휴대폰 부분 일치), 상태(ACTIVE/INACTIVE/WITHDRAWN), 검증 상태(SellerVerificationStatus) 필터로 판매자를 조회합니다. 최신 가입순, 보유 스토어 포함.",
  })
  @SwaggerResponse(200, { dataDto: MemberSellerListResponseDto })
  @SwaggerAuthResponses()
  async listSellers(@Query() query: MemberSellerListQueryDto) {
    return await this.memberManagementService.listSellers(query);
  }

  @Patch("sellers/:id/active")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 판매자 계정 활성/비활성 변경",
    description: "isActive: false면 계정 이용이 제한됩니다. 탈퇴한 회원은 변경할 수 없습니다.",
  })
  @SwaggerResponse(200, { dataDto: MemberSellerItemResponseDto })
  @SwaggerAuthResponses()
  @SwaggerResponse(400, {
    dataExample: createMessageObject(MEMBER_MANAGEMENT_ERROR_MESSAGES.MEMBER_WITHDRAWN),
  })
  @SwaggerResponse(404, {
    dataExample: createMessageObject(MEMBER_MANAGEMENT_ERROR_MESSAGES.SELLER_NOT_FOUND),
  })
  async updateSellerActive(@Param("id") id: string, @Body() dto: UpdateMemberActiveDto) {
    return await this.memberManagementService.updateSellerActive(id, dto);
  }
}
