import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Request,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiExtraModels } from "@nestjs/swagger";
import { OrderService } from "@apps/backend/modules/order/order.service";
import {
  CreateOrderRequestDto,
  CreateOrderResponseDto,
} from "@apps/backend/modules/order/dto/order-create.dto";
import { OrderResponseDto } from "@apps/backend/modules/order/dto/order-detail.dto";
import { Auth } from "@apps/backend/modules/auth/decorators/auth.decorator";
import { SwaggerResponse } from "@apps/backend/common/decorators/swagger-response.decorator";
import { SwaggerAuthResponses } from "@apps/backend/common/decorators/swagger-auth-responses.decorator";
import { ORDER_ERROR_MESSAGES } from "@apps/backend/modules/order/constants/order.constants";
import { UpdateOrderStatusResponseDto } from "@apps/backend/modules/order/dto/order-seller-action.dto";
import {
  CancelOrderBeforePaymentRequestDto,
  MarkPaymentCompleteRequestDto,
  RequestCancelRefundRequestDto,
  SubmitRefundAccountRequestDto,
} from "@apps/backend/modules/order/dto/order-user-action.dto";
import {
  UpdateReservationOrderItemsRequestDto,
  UpdateReservationPickupDateRequestDto,
} from "@apps/backend/modules/order/dto/order-user-reservation-edit.dto";
import { createMessageObject } from "@apps/backend/common/utils/message.util";
import { AUDIENCE } from "@apps/backend/modules/auth/constants/auth.constants";
import { JwtVerifiedPayload } from "@apps/backend/modules/auth/types/auth.types";
import {
  RefundCancellationPolicyDto,
  RefundRuleItemDto,
} from "@apps/backend/modules/store/dto/store-refund-cancellation-policy.dto";

/**
 * 사용자 주문 컨트롤러
 * 사용자 주문 관리 API 엔드포인트를 제공합니다.
 */
@ApiTags("주문")
@ApiExtraModels(
  CreateOrderResponseDto,
  OrderResponseDto,
  RefundCancellationPolicyDto,
  RefundRuleItemDto,
  UpdateOrderStatusResponseDto,
  CancelOrderBeforePaymentRequestDto,
  MarkPaymentCompleteRequestDto,
  RequestCancelRefundRequestDto,
  SubmitRefundAccountRequestDto,
  UpdateReservationPickupDateRequestDto,
  UpdateReservationOrderItemsRequestDto,
)
@Controller(`${AUDIENCE.CONSUMER}/orders`)
@Auth({ isPublic: false, audiences: ["consumer"] }) // 구매자 JWT(aud: user)만 허용
export class ConsumerOrderController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * 주문 생성 API
   * 상품을 주문합니다.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "(로그인 필요) 주문 생성",
    description:
      "상품을 주문합니다. 상품의 판매 상태와 노출 상태를 확인하고, 주문 항목의 수량과 금액을 검증한 후 주문을 생성합니다. 픽업 일시는 스토어 영업 캘린더(정기 휴무·표준 영업시간·일별 예외)에 맞아야 합니다. 생성된 주문 ID만 반환합니다.",
  })
  @SwaggerResponse(201, { dataDto: CreateOrderResponseDto })
  @SwaggerResponse(400, {
    dataExample: createMessageObject(ORDER_ERROR_MESSAGES.INVALID_ORDER_ITEMS),
  })
  @SwaggerResponse(400, {
    dataExample: createMessageObject(ORDER_ERROR_MESSAGES.INVALID_TOTAL_QUANTITY),
  })
  @SwaggerResponse(400, {
    dataExample: createMessageObject(ORDER_ERROR_MESSAGES.INVALID_TOTAL_PRICE),
  })
  @SwaggerResponse(400, {
    dataExample: createMessageObject(ORDER_ERROR_MESSAGES.PRODUCT_INACTIVE),
  })
  @SwaggerResponse(400, {
    dataExample: createMessageObject(ORDER_ERROR_MESSAGES.PRODUCT_NOT_AVAILABLE),
  })
  @SwaggerResponse(400, {
    dataExample: createMessageObject(ORDER_ERROR_MESSAGES.PICKUP_OUTSIDE_STORE_BUSINESS_HOURS),
  })
  @SwaggerAuthResponses()
  @SwaggerResponse(404, {
    dataExample: createMessageObject(ORDER_ERROR_MESSAGES.PRODUCT_NOT_FOUND),
  })
  async createOrder(
    @Body() createOrderDto: CreateOrderRequestDto,
    @Request() req: { user: JwtVerifiedPayload },
  ): Promise<CreateOrderResponseDto> {
    return await this.orderService.createOrderForUser(createOrderDto, req.user);
  }

  /**
   * 입금완료 처리 (사용자)
   * 입금대기 상태에서만 가능합니다. 입금 마감 시각(`paymentPendingDeadlineAt`)이 지나면 자동 취소됩니다.
   */
  @Patch(":id/payment-complete")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 입금완료 처리",
    description:
      "입금대기(PAYMENT_PENDING) 주문만 입금완료(PAYMENT_COMPLETED)로 변경합니다. 예약신청(RESERVATION_REQUESTED) 단계에서는 판매자가 입금대기로 바꾼 뒤에만 이용할 수 있습니다. 입금 마감 시각(픽업 일정에 따라 최대 12시간·6시간·1시간 중 적용)이 지난 경우 처리할 수 없습니다.",
  })
  @SwaggerResponse(200, { dataDto: UpdateOrderStatusResponseDto })
  @SwaggerAuthResponses()
  @SwaggerResponse(400, {
    dataExample: createMessageObject(ORDER_ERROR_MESSAGES.INVALID_USER_ORDER_ACTION),
  })
  @SwaggerResponse(400, {
    dataExample: createMessageObject(ORDER_ERROR_MESSAGES.PAYMENT_PENDING_EXPIRED),
  })
  @SwaggerResponse(403, {
    dataExample: createMessageObject(ORDER_ERROR_MESSAGES.FORBIDDEN),
  })
  @SwaggerResponse(404, {
    dataExample: createMessageObject(ORDER_ERROR_MESSAGES.NOT_FOUND),
  })
  async markPaymentComplete(
    @Param("id") id: string,
    @Body() dto: MarkPaymentCompleteRequestDto,
    @Request() req: { user: JwtVerifiedPayload },
  ): Promise<UpdateOrderStatusResponseDto> {
    return await this.orderService.markOrderPaymentCompletedForUser(id, req.user, dto);
  }

  /**
   * 입금 전 예약 취소 (사용자)
   */
  @Patch(":id/cancel-before-payment")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 입금 전 예약 취소",
    description:
      "예약신청(RESERVATION_REQUESTED) 또는 입금대기(PAYMENT_PENDING) 주문을 취소합니다. 취소 사유를 함께 저장합니다. 사용자가 이미 입금했다고 신고하면(hasDeposited=true, 입금대기 상태에서만 가능) 취소완료가 아니라 취소환불대기(CANCEL_REFUND_PENDING)로 전환되며 환불 계좌 3종을 함께 저장합니다. 그 외에는 취소완료(CANCEL_COMPLETED)로 종료됩니다.",
  })
  @SwaggerResponse(200, { dataDto: UpdateOrderStatusResponseDto })
  @SwaggerAuthResponses()
  @SwaggerResponse(400, {
    dataExample: createMessageObject(ORDER_ERROR_MESSAGES.INVALID_USER_ORDER_ACTION),
  })
  @SwaggerResponse(403, {
    dataExample: createMessageObject(ORDER_ERROR_MESSAGES.FORBIDDEN),
  })
  @SwaggerResponse(404, {
    dataExample: createMessageObject(ORDER_ERROR_MESSAGES.NOT_FOUND),
  })
  async cancelBeforePayment(
    @Param("id") id: string,
    @Body() dto: CancelOrderBeforePaymentRequestDto,
    @Request() req: { user: JwtVerifiedPayload },
  ): Promise<UpdateOrderStatusResponseDto> {
    return await this.orderService.cancelOrderBeforePaymentForUser(id, req.user, dto);
  }

  /**
   * 예약신청 단계 — 픽업 일시 변경 (사용자)
   */
  @Patch(":id/reservation/pickup-date")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 예약신청 단계 픽업 일시 변경",
    description:
      "주문 상태가 예약신청(RESERVATION_REQUESTED)일 때만 픽업 날짜·시간을 변경합니다. 변경할 픽업 일시는 스토어 영업 캘린더에 맞아야 합니다. 입금대기 이후에는 변경할 수 없습니다.",
  })
  @SwaggerResponse(200, { dataDto: UpdateOrderStatusResponseDto })
  @SwaggerAuthResponses()
  @SwaggerResponse(400, {
    dataExample: createMessageObject(ORDER_ERROR_MESSAGES.INVALID_USER_ORDER_ACTION),
  })
  @SwaggerResponse(400, {
    dataExample: createMessageObject(ORDER_ERROR_MESSAGES.PICKUP_OUTSIDE_STORE_BUSINESS_HOURS),
  })
  @SwaggerResponse(403, {
    dataExample: createMessageObject(ORDER_ERROR_MESSAGES.FORBIDDEN),
  })
  @SwaggerResponse(404, {
    dataExample: createMessageObject(ORDER_ERROR_MESSAGES.NOT_FOUND),
  })
  async updateReservationPickupDate(
    @Param("id") id: string,
    @Body() dto: UpdateReservationPickupDateRequestDto,
    @Request() req: { user: JwtVerifiedPayload },
  ): Promise<UpdateOrderStatusResponseDto> {
    return await this.orderService.updateReservationPickupDateForUser(id, req.user, dto);
  }

  /**
   * 예약신청 단계 — 주문 항목(옵션) 변경 (사용자)
   */
  @Patch(":id/reservation/items")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 예약신청 단계 주문 항목(옵션) 변경",
    description:
      "주문 상태가 예약신청(RESERVATION_REQUESTED)일 때만 주문 항목 전체를 교체합니다. 요청 본문은 주문 생성 API의 items·totalQuantity·totalPrice와 동일한 검증 규칙을 따릅니다. 당시 주문의 상품 기준으로 옵션 ID·가격이 재검증됩니다. 검증은 주문 시점 스냅샷이 아니라 DB에 저장된 상품의 현재 옵션·가격을 따르므로, 주문 이후 판매자가 옵션을 비활성화·삭제·가격 변경한 경우에는 기존에 고른 조합으로는 요청이 거절될 수 있습니다. 주문에 설정된 픽업 일시가 현재 스토어 영업 캘린더에 맞지 않으면 거절됩니다.",
  })
  @SwaggerResponse(200, { dataDto: UpdateOrderStatusResponseDto })
  @SwaggerAuthResponses()
  @SwaggerResponse(400, {
    dataExample: createMessageObject(ORDER_ERROR_MESSAGES.INVALID_ORDER_ITEMS),
  })
  @SwaggerResponse(400, {
    dataExample: createMessageObject(ORDER_ERROR_MESSAGES.INVALID_TOTAL_QUANTITY),
  })
  @SwaggerResponse(400, {
    dataExample: createMessageObject(ORDER_ERROR_MESSAGES.INVALID_TOTAL_PRICE),
  })
  @SwaggerResponse(400, {
    dataExample: createMessageObject(ORDER_ERROR_MESSAGES.INVALID_USER_ORDER_ACTION),
  })
  @SwaggerResponse(400, {
    dataExample: createMessageObject(ORDER_ERROR_MESSAGES.PRODUCT_INACTIVE),
  })
  @SwaggerResponse(400, {
    dataExample: createMessageObject(ORDER_ERROR_MESSAGES.PRODUCT_NOT_AVAILABLE),
  })
  @SwaggerResponse(400, {
    dataExample: createMessageObject(ORDER_ERROR_MESSAGES.PICKUP_OUTSIDE_STORE_BUSINESS_HOURS),
  })
  @SwaggerResponse(403, {
    dataExample: createMessageObject(ORDER_ERROR_MESSAGES.FORBIDDEN),
  })
  @SwaggerResponse(404, {
    dataExample: createMessageObject(ORDER_ERROR_MESSAGES.NOT_FOUND),
  })
  async updateReservationOrderItems(
    @Param("id") id: string,
    @Body() dto: UpdateReservationOrderItemsRequestDto,
    @Request() req: { user: JwtVerifiedPayload },
  ): Promise<UpdateOrderStatusResponseDto> {
    return await this.orderService.updateReservationOrderItemsForUser(id, req.user, dto);
  }

  /**
   * 환불 요청 (사용자)
   */
  @Patch(":id/refund-request")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 취소·환불 요청",
    description:
      "입금완료·예약확정·픽업대기 상태에서 취소·환불을 요청하면 취소환불대기(CANCEL_REFUND_PENDING)로 변경됩니다. 요청 시 취소 사유와 환불받을 계좌(은행·계좌번호·예금주)를 함께 보냅니다. 이후 판매자가 취소환불완료(CANCEL_REFUND_COMPLETED)로 처리합니다.",
  })
  @SwaggerResponse(200, { dataDto: UpdateOrderStatusResponseDto })
  @SwaggerAuthResponses()
  @SwaggerResponse(400, {
    dataExample: createMessageObject(ORDER_ERROR_MESSAGES.INVALID_USER_ORDER_ACTION),
  })
  @SwaggerResponse(403, {
    dataExample: createMessageObject(ORDER_ERROR_MESSAGES.FORBIDDEN),
  })
  @SwaggerResponse(404, {
    dataExample: createMessageObject(ORDER_ERROR_MESSAGES.NOT_FOUND),
  })
  async requestRefund(
    @Param("id") id: string,
    @Body() dto: RequestCancelRefundRequestDto,
    @Request() req: { user: JwtVerifiedPayload },
  ): Promise<UpdateOrderStatusResponseDto> {
    return await this.orderService.requestOrderRefundForUser(id, req.user, dto);
  }

  /**
   * 환불 계좌 입력 (사용자)
   */
  @Patch(":id/refund-account")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 환불 계좌 입력",
    description:
      "이미 취소환불대기(CANCEL_REFUND_PENDING)인 주문에 환불받을 계좌만 입력합니다. 주문 상태는 바뀌지 않습니다. 관리자가 취소완료 주문을 환불 처리로 되돌린 경우 환불 계좌가 비어 있어, 이 API로 구매자가 직접 입력합니다. 환불이 완료되기 전까지는 다시 입력해 수정할 수 있습니다.",
  })
  @SwaggerResponse(200, { dataDto: UpdateOrderStatusResponseDto })
  @SwaggerAuthResponses()
  @SwaggerResponse(400, {
    dataExample: createMessageObject(ORDER_ERROR_MESSAGES.INVALID_USER_ORDER_ACTION),
  })
  @SwaggerResponse(403, {
    dataExample: createMessageObject(ORDER_ERROR_MESSAGES.FORBIDDEN),
  })
  @SwaggerResponse(404, {
    dataExample: createMessageObject(ORDER_ERROR_MESSAGES.NOT_FOUND),
  })
  async submitRefundAccount(
    @Param("id") id: string,
    @Body() dto: SubmitRefundAccountRequestDto,
    @Request() req: { user: JwtVerifiedPayload },
  ): Promise<UpdateOrderStatusResponseDto> {
    return await this.orderService.submitRefundAccountForUser(id, req.user, dto);
  }

  /**
   * 주문 상세조회 API
   * 자신의 주문 정보를 조회합니다.
   */
  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 주문 상세조회",
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
  async getOrderById(
    @Param("id") id: string,
    @Request() req: { user: JwtVerifiedPayload },
  ): Promise<OrderResponseDto> {
    return await this.orderService.getOrderByIdForUser(id, req.user);
  }
}
