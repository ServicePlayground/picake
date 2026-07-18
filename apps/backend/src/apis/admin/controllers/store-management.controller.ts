import { Controller, Get, HttpCode, HttpStatus, Param, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiExtraModels } from "@nestjs/swagger";
import { Auth } from "@apps/backend/modules/auth/decorators/auth.decorator";
import { SwaggerResponse } from "@apps/backend/common/decorators/swagger-response.decorator";
import { SwaggerAuthResponses } from "@apps/backend/common/decorators/swagger-auth-responses.decorator";
import { PaginationMetaResponseDto } from "@apps/backend/common/dto/pagination-response.dto";
import { createMessageObject } from "@apps/backend/common/utils/message.util";
import { AUDIENCE } from "@apps/backend/modules/auth/constants/auth.constants";
import { STORE_MANAGEMENT_ERROR_MESSAGES } from "@apps/backend/modules/store-management/constants/store-management.constants";
import {
  StoreManagementDetailResponseDto,
  StoreManagementItemResponseDto,
  StoreManagementListQueryDto,
  StoreManagementListResponseDto,
  StoreManagementOrderStatusCountDto,
  StoreManagementRecentPeriodStatDto,
  StoreManagementSellerDto,
  StoreManagementStatisticsDto,
  StoreManagementTopProductStatDto,
} from "@apps/backend/modules/store-management/dto/store-management.dto";
import { StoreManagementService } from "@apps/backend/modules/store-management/services/store-management.service";

/**
 * 스토어 관리 컨트롤러 (관리자)
 */
@ApiTags("[관리자] 스토어 관리")
@ApiExtraModels(
  StoreManagementItemResponseDto,
  StoreManagementListResponseDto,
  StoreManagementDetailResponseDto,
  StoreManagementSellerDto,
  StoreManagementStatisticsDto,
  StoreManagementOrderStatusCountDto,
  StoreManagementRecentPeriodStatDto,
  StoreManagementTopProductStatDto,
  PaginationMetaResponseDto,
)
@Controller(`${AUDIENCE.ADMIN}/store-management`)
@Auth({ isPublic: false, audiences: [AUDIENCE.ADMIN] })
export class AdminStoreManagementController {
  constructor(private readonly storeManagementService: StoreManagementService) {}

  @Get("stores")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 스토어 목록 조회",
    description:
      "검색어(스토어명·사업자명·사업자번호·연락처·판매자 이름·닉네임·휴대폰)와 판매자 상태 필터로 스토어를 조회합니다. 최신 등록순, 상품·주문 수 포함.",
  })
  @SwaggerResponse(200, { dataDto: StoreManagementListResponseDto })
  @SwaggerAuthResponses()
  async listStores(@Query() query: StoreManagementListQueryDto) {
    return await this.storeManagementService.list(query);
  }

  @Get("stores/:id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 스토어 상세 조회",
    description:
      "사업자·정산·채널·판매자 정보와 함께 주문·매출 통계(상태별 건수, 최근 7·30일, GMV·상위 상품은 픽업 완료 기준)를 반환합니다.",
  })
  @SwaggerResponse(200, { dataDto: StoreManagementDetailResponseDto })
  @SwaggerAuthResponses()
  @SwaggerResponse(404, {
    dataExample: createMessageObject(STORE_MANAGEMENT_ERROR_MESSAGES.STORE_NOT_FOUND),
  })
  async getStore(@Param("id") id: string) {
    return await this.storeManagementService.getById(id);
  }
}
