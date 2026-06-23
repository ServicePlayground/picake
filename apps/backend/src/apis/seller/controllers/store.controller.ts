import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  HttpCode,
  HttpStatus,
  Request,
  Param,
  Query,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiExtraModels } from "@nestjs/swagger";
import { StoreService } from "@apps/backend/modules/store/store.service";
import { Auth } from "@apps/backend/modules/auth/decorators/auth.decorator";
import { SwaggerResponse } from "@apps/backend/common/decorators/swagger-response.decorator";
import { SwaggerAuthResponses } from "@apps/backend/common/decorators/swagger-auth-responses.decorator";
import {
  CreateStoreRequestDto,
  CreateStoreResponseDto,
} from "@apps/backend/modules/store/dto/store-create.dto";
import {
  UpdateStoreRequestDto,
  UpdateStoreResponseDto,
} from "@apps/backend/modules/store/dto/store-update.dto";
import { createMessageObject } from "@apps/backend/common/utils/message.util";
import { AUDIENCE } from "@apps/backend/modules/auth/constants/auth.constants";
import {
  NTS_API_ERROR_MESSAGES,
  KFTC_API_ERROR_MESSAGES,
} from "@apps/backend/modules/business/constants/business.contants";
import { JwtVerifiedPayload } from "@apps/backend/modules/auth/types/auth.types";
import { STORE_ERROR_MESSAGES } from "@apps/backend/modules/store/constants/store.constants";
import {
  GetSellerStoresRequestDto,
  StoreListResponseDto,
} from "@apps/backend/modules/store/dto/store-list.dto";
import { StoreResponseDto } from "@apps/backend/modules/store/dto/store-detail.dto";
import {
  StoreBusinessCalendarDto,
  UpdateStoreBusinessCalendarResponseDto,
} from "@apps/backend/modules/store/dto/store-business-calendar.dto";
import {
  RefundCancellationPolicyDto,
  RefundRuleItemDto,
} from "@apps/backend/modules/store/dto/store-refund-cancellation-policy.dto";

/**
 * 스토어 관련 컨트롤러
 */
@ApiTags("스토어")
@ApiExtraModels(
  CreateStoreResponseDto,
  UpdateStoreResponseDto,
  StoreListResponseDto,
  StoreResponseDto,
  StoreBusinessCalendarDto,
  UpdateStoreBusinessCalendarResponseDto,
  RefundCancellationPolicyDto,
  RefundRuleItemDto,
)
@Controller(`${AUDIENCE.SELLER}/store`)
@Auth({ isPublic: false, audiences: ["seller"] }) // 판매자 JWT(aud: seller)만 허용
export class SellerStoreController {
  constructor(private readonly storeService: StoreService) {}

  /**
   * 스토어 생성 API (3단계)
   * 1단계, 2단계의 요청 파라미터를 재검증하고 스토어를 생성합니다.
   */
  @Post("/create")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "(로그인 필요) 스토어 생성 (3단계)",
    description:
      "1단계(사업자등록번호 진위확인)와 2단계(통신판매사업자 등록상세 조회)의 요청 파라미터를 재검증하고 스토어를 생성합니다. \n1단계 사업자등록번호는 2단계 사업자등록번호와 같아야 합니다. \n같은 사업자등록번호와 인허가관리번호(통신판매사업자 신고번호) 조합으로 이미 스토어가 존재하면 오류가 발생합니다.",
  })
  @SwaggerResponse(201, { dataDto: CreateStoreResponseDto })
  // 사업자등록번호 진위확인 API 오류 응답
  @SwaggerResponse(400, {
    dataExample: createMessageObject(NTS_API_ERROR_MESSAGES.BUSINESS_STATUS_INACTIVE),
  })
  @SwaggerResponse(400, { dataExample: createMessageObject(NTS_API_ERROR_MESSAGES.HTTP_ERROR) })
  @SwaggerResponse(400, { dataExample: createMessageObject(NTS_API_ERROR_MESSAGES.INTERNAL_ERROR) })
  @SwaggerResponse(400, {
    dataExample: createMessageObject(NTS_API_ERROR_MESSAGES.TOO_LARGE_REQUEST),
  })
  @SwaggerResponse(400, {
    dataExample: createMessageObject(NTS_API_ERROR_MESSAGES.REQUEST_DATA_MALFORMED),
  })
  @SwaggerResponse(400, {
    dataExample: createMessageObject(NTS_API_ERROR_MESSAGES.BAD_JSON_REQUEST),
  })
  // 통신판매사업자 등록상세 조회 API 오류 응답
  @SwaggerResponse(400, { dataExample: createMessageObject(KFTC_API_ERROR_MESSAGES["01"]) })
  @SwaggerResponse(400, { dataExample: createMessageObject(KFTC_API_ERROR_MESSAGES["02"]) })
  @SwaggerResponse(400, { dataExample: createMessageObject(KFTC_API_ERROR_MESSAGES["03"]) })
  @SwaggerResponse(400, { dataExample: createMessageObject(KFTC_API_ERROR_MESSAGES["04"]) })
  @SwaggerResponse(400, { dataExample: createMessageObject(KFTC_API_ERROR_MESSAGES["05"]) })
  @SwaggerResponse(400, { dataExample: createMessageObject(KFTC_API_ERROR_MESSAGES["10"]) })
  @SwaggerResponse(400, { dataExample: createMessageObject(KFTC_API_ERROR_MESSAGES["11"]) })
  @SwaggerResponse(400, { dataExample: createMessageObject(KFTC_API_ERROR_MESSAGES["12"]) })
  @SwaggerResponse(400, { dataExample: createMessageObject(KFTC_API_ERROR_MESSAGES["20"]) })
  @SwaggerResponse(400, { dataExample: createMessageObject(KFTC_API_ERROR_MESSAGES["21"]) })
  @SwaggerResponse(400, { dataExample: createMessageObject(KFTC_API_ERROR_MESSAGES["22"]) })
  @SwaggerResponse(400, { dataExample: createMessageObject(KFTC_API_ERROR_MESSAGES["30"]) })
  @SwaggerResponse(400, { dataExample: createMessageObject(KFTC_API_ERROR_MESSAGES["31"]) })
  @SwaggerResponse(400, { dataExample: createMessageObject(KFTC_API_ERROR_MESSAGES["32"]) })
  @SwaggerResponse(400, { dataExample: createMessageObject(KFTC_API_ERROR_MESSAGES["33"]) })
  @SwaggerResponse(400, {
    dataExample: createMessageObject(KFTC_API_ERROR_MESSAGES.OPERATION_STATUS_NOT_NORMAL),
  })
  @SwaggerResponse(400, {
    dataExample: createMessageObject(
      KFTC_API_ERROR_MESSAGES.ONLINE_TRADING_COMPANY_DETAIL_NOT_FOUND,
    ),
  })
  @SwaggerResponse(400, { dataExample: createMessageObject(KFTC_API_ERROR_MESSAGES.HTTP_ERROR) })
  @SwaggerResponse(400, {
    dataExample: createMessageObject(KFTC_API_ERROR_MESSAGES.INTERNAL_ERROR),
  })
  // 스토어 생성 오류 응답
  @SwaggerResponse(400, {
    dataExample: createMessageObject(STORE_ERROR_MESSAGES.BUSINESS_REGISTRATION_NUMBER_MISMATCH),
  })
  @SwaggerResponse(400, {
    dataExample: createMessageObject(
      STORE_ERROR_MESSAGES.STORE_ALREADY_EXISTS_WITH_SAME_BUSINESS_INFO,
    ),
  })
  @SwaggerAuthResponses()
  async createStore(
    @Request() req: { user: JwtVerifiedPayload },
    @Body() createStoreDto: CreateStoreRequestDto,
  ) {
    return await this.storeService.createStoreForSeller(req.user.sub, createStoreDto);
  }

  /**
   * 내 스토어 목록 조회 API
   * 현재 로그인한 사용자가 등록한 모든 스토어 목록을 조회합니다. 검색, 정렬, 페이지네이션을 지원합니다.
   */
  @Get("/list")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 내 스토어 목록 조회",
    description:
      "현재 로그인한 사용자가 등록한 모든 스토어 목록을 조회합니다. 검색어(스토어명), 정렬, 상품 필터(sizes, minPrice, maxPrice, productCategoryTypes), 페이지네이션을 지원합니다.",
  })
  @SwaggerResponse(200, { dataDto: StoreListResponseDto })
  @SwaggerAuthResponses()
  async getMyStores(
    @Request() req: { user: JwtVerifiedPayload },
    @Query() query: GetSellerStoresRequestDto,
  ) {
    return await this.storeService.getStoresByUserIdForSeller(req.user.sub, query);
  }

  /**
   * 내 스토어 상세 조회 API
   * 자신이 소유한 스토어만 조회 가능합니다.
   * 로그인한 사용자의 경우 해당 스토어의 좋아요 여부(isLiked)도 함께 반환됩니다.
   */
  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 스토어 상세 조회",
    description:
      "자신이 소유한 스토어의 상세 정보를 조회합니다. 로그인한 사용자의 경우 해당 스토어의 좋아요 여부(isLiked)도 함께 반환됩니다.",
  })
  @SwaggerResponse(200, { dataDto: StoreResponseDto })
  @SwaggerAuthResponses()
  @SwaggerResponse(403, { dataExample: createMessageObject(STORE_ERROR_MESSAGES.FORBIDDEN) })
  @SwaggerResponse(404, { dataExample: createMessageObject(STORE_ERROR_MESSAGES.NOT_FOUND) })
  async getStoreDetail(@Param("id") id: string, @Request() req: { user: JwtVerifiedPayload }) {
    return await this.storeService.getStoreByIdForSeller(id, req.user);
  }

  /**
   * 스토어 영업 캘린더 수정 API
   * 정기 휴무·표준 영업 시간·날짜별 예외를 저장합니다.
   */
  @Put(":id/business-calendar")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 스토어 영업 캘린더 수정",
    description:
      "정기 휴무 요일(0=일…6=토), 표준 영업 시간(HH:mm, 30분 단위), 날짜별 예외를 저장합니다. 픽업 시각은 Asia/Seoul 기준. 표준(또는 일별 영업)이 00:00~00:00이면 하루 전체(모든 시각)로 해석하고, 그 외에는 종료 시각은 픽업 구간 상한(미포함)입니다.",
  })
  @SwaggerResponse(200, { dataDto: UpdateStoreBusinessCalendarResponseDto })
  @SwaggerAuthResponses()
  @SwaggerResponse(400, {
    dataExample: createMessageObject(STORE_ERROR_MESSAGES.BUSINESS_CALENDAR_ORDER_CONFLICT),
  })
  @SwaggerResponse(400, {
    dataExample: createMessageObject(STORE_ERROR_MESSAGES.BUSINESS_CALENDAR_STANDARD_TIME_ORDER),
  })
  @SwaggerResponse(403, { dataExample: createMessageObject(STORE_ERROR_MESSAGES.FORBIDDEN) })
  @SwaggerResponse(404, { dataExample: createMessageObject(STORE_ERROR_MESSAGES.NOT_FOUND) })
  async updateBusinessCalendar(
    @Param("id") id: string,
    @Body() body: StoreBusinessCalendarDto,
    @Request() req: { user: JwtVerifiedPayload },
  ) {
    return await this.storeService.updateBusinessCalendarForSeller(id, body, req.user);
  }

  /**
   * 스토어 수정 API
   * 판매자가 등록한 스토어를 수정합니다.
   */
  @Put(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 스토어 수정",
    description: "판매자가 등록한 스토어를 수정합니다.",
  })
  @SwaggerResponse(200, { dataDto: UpdateStoreResponseDto })
  @SwaggerAuthResponses()
  @SwaggerResponse(403, { dataExample: createMessageObject(STORE_ERROR_MESSAGES.FORBIDDEN) })
  @SwaggerResponse(404, { dataExample: createMessageObject(STORE_ERROR_MESSAGES.NOT_FOUND) })
  async updateStore(
    @Param("id") id: string,
    @Body() updateStoreDto: UpdateStoreRequestDto,
    @Request() req: { user: JwtVerifiedPayload },
  ) {
    return await this.storeService.updateStoreForSeller(id, updateStoreDto, req.user);
  }
}
