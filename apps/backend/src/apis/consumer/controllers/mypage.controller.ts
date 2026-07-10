import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Query,
  Param,
  Body,
  Request,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiExtraModels } from "@nestjs/swagger";
import { OrderService } from "@apps/backend/modules/order/order.service";
import { ReviewService } from "@apps/backend/modules/review/review.service";
import { LikeService } from "@apps/backend/modules/like/like.service";
import { RecentViewService } from "@apps/backend/modules/recent-view/recent-view.service";
import { Auth } from "@apps/backend/modules/auth/decorators/auth.decorator";
import { SwaggerResponse } from "@apps/backend/common/decorators/swagger-response.decorator";
import { SwaggerAuthResponses } from "@apps/backend/common/decorators/swagger-auth-responses.decorator";
import {
  AUDIENCE,
  AUTH_ERROR_MESSAGES,
  AUTH_SUCCESS_MESSAGES,
} from "@apps/backend/modules/auth/constants/auth.constants";
import { JwtVerifiedPayload } from "@apps/backend/modules/auth/types/auth.types";
import {
  OrderListResponseDto,
  OrderListRequestDto,
} from "@apps/backend/modules/order/dto/order-list.dto";
import {
  OrderItemResponseDto,
  OrderResponseDto,
} from "@apps/backend/modules/order/dto/order-detail.dto";
import {
  GetMyReviewsRequestDto,
  MyReviewListResponseDto,
} from "@apps/backend/modules/review/dto/review-user-list.dto";
import {
  GetWritableReviewOrdersRequestDto,
  WritableReviewOrdersListResponseDto,
} from "@apps/backend/modules/review/dto/review-writable-list.dto";
import { ReviewDeleteResponseDto } from "@apps/backend/modules/review/dto/review-delete.dto";
import { CreateMyReviewRequestDto } from "@apps/backend/modules/review/dto/review-create.dto";
import {
  ReviewResponseDto,
  MyReviewResponseDto,
} from "@apps/backend/modules/review/dto/review-detail.dto";
import { REVIEW_ERROR_MESSAGES } from "@apps/backend/modules/review/constants/review.constants";
import {
  GetStoresRequestDto,
  StoreListResponseDto,
} from "@apps/backend/modules/store/dto/store-list.dto";
import {
  GetProductsRequestDto,
  ProductListResponseDto,
} from "@apps/backend/modules/product/dto/product-list.dto";
import { GetRecentViewedProductsRequestDto } from "@apps/backend/modules/recent-view/dto/recent-view-list.dto";
import { ORDER_ERROR_MESSAGES } from "@apps/backend/modules/order/constants/order.constants";
import { createMessageObject } from "@apps/backend/common/utils/message.util";
import { AuthMypagePhoneService } from "@apps/backend/modules/auth/services/auth-mypage-phone.service";
import { AuthMypageProfileService } from "@apps/backend/modules/auth/services/auth-mypage-profile.service";
import {
  ChangePhoneRequestDto,
  ConsumerMypageProfileResponseDto,
  UpdateMypageProfileRequestDto,
} from "@apps/backend/modules/auth/dto/mypage-profile.dto";
import { AuthWithdrawService } from "@apps/backend/modules/auth/services/auth-withdraw.service";
import { WithdrawAccountRequestDto } from "@apps/backend/modules/auth/dto/auth-withdraw.dto";
import {
  RefundCancellationPolicyDto,
  RefundRuleItemDto,
} from "@apps/backend/modules/store/dto/store-refund-cancellation-policy.dto";
import { NotificationService } from "@apps/backend/modules/notification/services/notification.service";
import {
  UserNotificationPreferenceResponseDto,
  UserNotificationPreferenceUpdateDto,
} from "@apps/backend/modules/notification/dto/user-notification.dto";

/**
 * 마이페이지 컨트롤러
 * 사용자용 마이페이지 관련 API 엔드포인트를 제공합니다.
 */
@ApiTags("마이페이지")
@ApiExtraModels(
  OrderListResponseDto,
  OrderResponseDto,
  OrderItemResponseDto,
  RefundCancellationPolicyDto,
  RefundRuleItemDto,
  MyReviewListResponseDto,
  WritableReviewOrdersListResponseDto,
  GetWritableReviewOrdersRequestDto,
  ReviewDeleteResponseDto,
  ReviewResponseDto,
  MyReviewResponseDto,
  CreateMyReviewRequestDto,
  StoreListResponseDto,
  ProductListResponseDto,
  UpdateMypageProfileRequestDto,
  ConsumerMypageProfileResponseDto,
  ChangePhoneRequestDto,
  UserNotificationPreferenceResponseDto,
)
@Controller(`${AUDIENCE.CONSUMER}/mypage`)
@Auth({ isPublic: false, audiences: ["consumer"] })
export class ConsumerMypageController {
  constructor(
    private readonly mypageProfile: AuthMypageProfileService,
    private readonly mypagePhone: AuthMypagePhoneService,
    private readonly withdrawService: AuthWithdrawService,
    private readonly orderService: OrderService,
    private readonly reviewService: ReviewService,
    private readonly likeService: LikeService,
    private readonly recentViewService: RecentViewService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * 내 프로필 조회
   */
  @Get("profile")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 내 프로필 조회",
    description: "로그인한 구매자의 프로필 정보를 조회합니다.",
  })
  @SwaggerResponse(200, { dataDto: ConsumerMypageProfileResponseDto })
  @SwaggerAuthResponses()
  async getMyProfile(@Request() req: { user: JwtVerifiedPayload }) {
    return await this.mypageProfile.getConsumerProfile(req.user);
  }

  /**
   * 내 프로필 부분 수정
   */
  @Patch("profile")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 내 프로필 수정",
    description:
      "이름·닉네임·프로필 이미지 URL 중 요청 본문에 포함된 항목만 갱신합니다. 화면마다 일부 필드만 보내도 됩니다. `profileImageUrl`에 `null`을 보내면 프로필 이미지를 제거합니다.",
  })
  @SwaggerResponse(200, { dataDto: ConsumerMypageProfileResponseDto })
  @SwaggerAuthResponses()
  @SwaggerResponse(400, {
    dataExample: createMessageObject(AUTH_ERROR_MESSAGES.PROFILE_UPDATE_NO_FIELDS),
  })
  async patchMyProfile(
    @Body() body: UpdateMypageProfileRequestDto,
    @Request() req: { user: JwtVerifiedPayload },
  ) {
    return await this.mypageProfile.updateConsumerMypageProfile(body, req.user);
  }

  /**
   * 휴대폰 번호 변경
   */
  @Post("change-phone")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 휴대폰 번호 변경",
    description:
      "인증된 구매자의 휴대폰 번호를 새 번호로 변경합니다. 새 번호는 `purpose: phone_change`로 미리 인증이 완료되어야 합니다.",
  })
  @SwaggerResponse(200, { dataExample: createMessageObject(AUTH_SUCCESS_MESSAGES.PHONE_CHANGED) })
  @SwaggerAuthResponses()
  async changePhone(
    @Body() changePhoneDto: ChangePhoneRequestDto,
    @Request() req: { user: JwtVerifiedPayload },
  ) {
    await this.mypagePhone.changePhone(changePhoneDto, req.user, AUDIENCE.CONSUMER);
    return createMessageObject(AUTH_SUCCESS_MESSAGES.PHONE_CHANGED);
  }

  @Post("withdraw")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 회원 탈퇴",
    description:
      "로그인한 구매자 계정과 연관 데이터를 삭제합니다. 탈퇴 후 동일 OAuth·휴대폰으로 신규 가입할 수 있습니다. 진행 중인 주문(예약신청·입금대기·입금완료·예약확정·픽업대기·취소환불대기)이 있으면 탈퇴할 수 없습니다.",
  })
  @SwaggerResponse(200, {
    dataExample: createMessageObject(AUTH_SUCCESS_MESSAGES.ACCOUNT_WITHDRAWN),
  })
  @SwaggerAuthResponses()
  async withdrawAccount(
    @Body() body: WithdrawAccountRequestDto,
    @Request() req: { user: JwtVerifiedPayload },
  ) {
    await this.withdrawService.withdraw(AUDIENCE.CONSUMER, req.user.sub, body.reason);
    return createMessageObject(AUTH_SUCCESS_MESSAGES.ACCOUNT_WITHDRAWN);
  }

  @Get("notification-preferences")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 알림설정 조회",
    description: "알림설정을 조회합니다. 설정이 없으면 기본값(켜짐)으로 생성합니다.",
  })
  @SwaggerResponse(200, { dataDto: UserNotificationPreferenceResponseDto })
  @SwaggerAuthResponses()
  async getNotificationPreferences(
    @Request() req: { user: JwtVerifiedPayload },
  ): Promise<UserNotificationPreferenceResponseDto> {
    return this.notificationService.getOrCreatePreferenceUserWeb(req.user.sub);
  }

  @Put("notification-preferences")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 마이페이지 알림설정 저장",
    description: "알림설정을 수정합니다. 전달된 필드만 반영됩니다.",
  })
  @SwaggerResponse(200, { dataDto: UserNotificationPreferenceResponseDto })
  @SwaggerAuthResponses()
  async updateNotificationPreferences(
    @Body() body: UserNotificationPreferenceUpdateDto,
    @Request() req: { user: JwtVerifiedPayload },
  ): Promise<UserNotificationPreferenceResponseDto> {
    return this.notificationService.updatePreferenceUserWeb(req.user.sub, body);
  }

  /**
   * 내 주문 목록 조회 API
   */
  @Get("orders")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 내 주문 목록 조회",
    description:
      "자신의 주문 목록을 조회합니다. 픽업 예정/지난 예약(type), 스토어/상태/기간/주문번호 필터, 정렬(sortBy), 페이지네이션을 지원합니다.",
  })
  @SwaggerResponse(200, { dataDto: OrderListResponseDto })
  @SwaggerAuthResponses()
  async getMyOrders(
    @Query() query: OrderListRequestDto,
    @Request() req: { user: JwtVerifiedPayload },
  ): Promise<OrderListResponseDto> {
    return await this.orderService.getUserOrdersForUser(query, req.user);
  }

  /**
   * 내 주문 상세 조회 API
   * 자신의 주문 상세 정보를 조회합니다.
   */
  @Get("orders/:id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 내 주문 상세 조회",
    description:
      "주문 ID를 통해 자신의 주문 상세 정보를 조회합니다. 자신의 주문만 조회할 수 있습니다.",
  })
  @SwaggerResponse(200, { dataDto: OrderResponseDto })
  @SwaggerAuthResponses()
  @SwaggerResponse(403, {
    dataExample: createMessageObject(ORDER_ERROR_MESSAGES.FORBIDDEN),
  })
  @SwaggerResponse(404, {
    dataExample: createMessageObject(ORDER_ERROR_MESSAGES.NOT_FOUND),
  })
  async getMyOrderById(
    @Param("id") id: string,
    @Request() req: { user: JwtVerifiedPayload },
  ): Promise<OrderResponseDto> {
    return await this.orderService.getOrderByIdForUser(id, req.user);
  }

  /**
   * 작성 가능한 후기 대상 주문 목록 조회 API
   */
  @Get("reviews/writable")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 작성 가능한 후기 대상 주문 목록",
    description:
      "픽업 완료이면서 아직 후기가 없는 본인 주문만 반환합니다. 해당 주문에 연결된 후기를 삭제한 경우(재작성 불가)에는 목록에 포함되지 않습니다.",
  })
  @SwaggerResponse(200, { dataDto: WritableReviewOrdersListResponseDto })
  @SwaggerAuthResponses()
  async getWritableReviewOrders(
    @Query() query: GetWritableReviewOrdersRequestDto,
    @Request() req: { user: JwtVerifiedPayload },
  ): Promise<WritableReviewOrdersListResponseDto> {
    return await this.reviewService.getWritableReviewOrdersForUser(req.user.sub, query);
  }

  /**
   * 내가 작성한 후기 목록 조회 API
   * 자신이 작성한 후기 목록을 조회합니다.
   */
  @Get("reviews")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 내가 작성한 후기 목록 조회",
    description: "자신이 작성한 후기 목록을 조회합니다. 정렬, 페이지네이션을 지원합니다.",
  })
  @SwaggerResponse(200, { dataDto: MyReviewListResponseDto })
  @SwaggerAuthResponses()
  async getMyReviews(
    @Query() query: GetMyReviewsRequestDto,
    @Request() req: { user: JwtVerifiedPayload },
  ): Promise<MyReviewListResponseDto> {
    return await this.reviewService.getMyReviewsForUser(req.user.sub, query);
  }

  /**
   * 내가 작성한 후기 단건 조회 API
   */
  @Get("reviews/:reviewId")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 내가 작성한 후기 상세 조회",
    description:
      "본인이 작성한 활성 후기(소프트 삭제 제외) 한 건을 조회합니다. 연결된 주문·상품 요약·스토어 정보를 포함합니다.",
  })
  @SwaggerResponse(200, { dataDto: MyReviewResponseDto })
  @SwaggerAuthResponses()
  @SwaggerResponse(404, {
    dataExample: createMessageObject(REVIEW_ERROR_MESSAGES.REVIEW_NOT_FOUND),
  })
  async getMyReviewById(
    @Param("reviewId") reviewId: string,
    @Request() req: { user: JwtVerifiedPayload },
  ): Promise<MyReviewResponseDto> {
    return await this.reviewService.getMyReviewDetailForUser(req.user.sub, reviewId);
  }

  /**
   * 내 후기 작성 API
   * 픽업 완료된 본인 주문에 대해 후기를 등록합니다. 주문당 1회만 작성할 수 있습니다.
   */
  @Post("reviews")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "(로그인 필요) 내 후기 작성",
    description:
      "픽업 완료(PICKUP_COMPLETED) 상태인 본인 주문을 기준으로 상품 후기를 작성합니다. 동일 주문으로는 한 번만 작성 가능하며, 해당 주문의 후기를 삭제한 뒤에는 다시 작성할 수 없습니다.",
  })
  @SwaggerResponse(201, { dataDto: MyReviewResponseDto })
  @SwaggerAuthResponses()
  @SwaggerResponse(400, {
    dataExample: createMessageObject(REVIEW_ERROR_MESSAGES.REVIEW_ORDER_NOT_ELIGIBLE),
  })
  @SwaggerResponse(400, {
    dataExample: createMessageObject(REVIEW_ERROR_MESSAGES.REVIEW_REVOKED_CANNOT_REWRITE),
  })
  @SwaggerResponse(403, {
    dataExample: createMessageObject(ORDER_ERROR_MESSAGES.FORBIDDEN),
  })
  @SwaggerResponse(404, {
    dataExample: createMessageObject(ORDER_ERROR_MESSAGES.NOT_FOUND),
  })
  @SwaggerResponse(409, {
    dataExample: createMessageObject(REVIEW_ERROR_MESSAGES.REVIEW_ALREADY_WRITTEN),
  })
  async createMyReview(
    @Body() body: CreateMyReviewRequestDto,
    @Request() req: { user: JwtVerifiedPayload },
  ): Promise<MyReviewResponseDto> {
    return await this.reviewService.createMyReviewForUser(req.user.sub, body);
  }

  /**
   * 내 후기 삭제 API
   * 자신이 작성한 후기만 삭제할 수 있습니다.
   */
  @Delete("reviews/:reviewId")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 내가 작성한 후기 삭제",
    description:
      "자신이 작성한 후기를 삭제합니다. 주문과 연결된 후기인 경우, 삭제 후 동일 주문으로 후기를 다시 작성할 수 없으며 작성 가능 목록에서도 제외됩니다.",
  })
  @SwaggerResponse(200, { dataDto: ReviewDeleteResponseDto })
  @SwaggerAuthResponses()
  @SwaggerResponse(403, {
    dataExample: createMessageObject(REVIEW_ERROR_MESSAGES.REVIEW_FORBIDDEN),
  })
  @SwaggerResponse(404, {
    dataExample: createMessageObject(REVIEW_ERROR_MESSAGES.REVIEW_NOT_FOUND),
  })
  async deleteMyReview(
    @Param("reviewId") reviewId: string,
    @Request() req: { user: JwtVerifiedPayload },
  ) {
    return await this.reviewService.deleteMyReviewForUser(req.user.sub, reviewId);
  }

  /**
   * 내가 좋아요한 스토어 목록 조회 API
   */
  @Get("likes/stores")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 내가 좋아요한 스토어 목록 조회",
    description:
      "자신이 좋아요한 스토어 목록을 조회합니다. 정렬(sortBy), 스토어명 검색(search), 지역(regions), 상품 필터(sizes, minPrice, maxPrice, productCategoryTypes), 페이지네이션을 지원합니다.",
  })
  @SwaggerResponse(200, { dataDto: StoreListResponseDto })
  @SwaggerAuthResponses()
  async getMyStoreLikes(
    @Query() query: GetStoresRequestDto,
    @Request() req: { user: JwtVerifiedPayload },
  ): Promise<StoreListResponseDto> {
    return await this.likeService.getMyStoreLikesForUser(req.user.sub, query);
  }

  /**
   * 내가 좋아요한 상품 목록 조회 API
   */
  @Get("likes/products")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 내가 좋아요한 상품 목록 조회",
    description:
      "자신이 좋아요한 상품 목록을 조회합니다. 정렬(sortBy), 검색/가격/스토어/타입/카테고리/지역 필터, 페이지네이션을 지원합니다.",
  })
  @SwaggerResponse(200, { dataDto: ProductListResponseDto })
  @SwaggerAuthResponses()
  async getMyProductLikes(
    @Query() query: GetProductsRequestDto,
    @Request() req: { user: JwtVerifiedPayload },
  ): Promise<ProductListResponseDto> {
    return await this.likeService.getMyProductLikesForUser(req.user.sub, query);
  }

  /**
   * 최근 본 상품 목록 조회 API
   */
  @Get("recent/products")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 최근 본 상품 목록 조회",
    description:
      "마이페이지에서 자신이 최근 조회한 상품 목록을 조회합니다. 노출 중인 상품만 포함되며, 조회 시점 기준 최근본순, 페이지네이션을 지원합니다.",
  })
  @SwaggerResponse(200, { dataDto: ProductListResponseDto })
  @SwaggerAuthResponses()
  async getRecentViewedProducts(
    @Query() query: GetRecentViewedProductsRequestDto,
    @Request() req: { user: JwtVerifiedPayload },
  ): Promise<ProductListResponseDto> {
    return await this.recentViewService.getRecentViewedProductsForUser(req.user.sub, query);
  }
}
