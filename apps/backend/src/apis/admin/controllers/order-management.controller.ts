import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiExtraModels } from "@nestjs/swagger";
import { Auth } from "@apps/backend/modules/auth/decorators/auth.decorator";
import { SwaggerResponse } from "@apps/backend/common/decorators/swagger-response.decorator";
import { SwaggerAuthResponses } from "@apps/backend/common/decorators/swagger-auth-responses.decorator";
import { PaginationMetaResponseDto } from "@apps/backend/common/dto/pagination-response.dto";
import { createMessageObject } from "@apps/backend/common/utils/message.util";
import { AUDIENCE } from "@apps/backend/modules/auth/constants/auth.constants";
import { ORDER_ERROR_MESSAGES } from "@apps/backend/modules/order/constants/order.constants";
import {
  AdminRefundCandidateListRequestDto,
  AdminRefundCandidateListResponseDto,
  AdminRevertToRefundPendingRequestDto,
} from "@apps/backend/modules/order/dto/order-admin-action.dto";
import { OrderResponseDto } from "@apps/backend/modules/order/dto/order-detail.dto";
import { UpdateOrderStatusResponseDto } from "@apps/backend/modules/order/dto/order-seller-action.dto";
import { OrderService } from "@apps/backend/modules/order/order.service";

/**
 * 주문 관리 컨트롤러 (관리자)
 *
 * 취소완료(CANCEL_COMPLETED)는 나가는 경로가 없는 종착 상태입니다. 무통장입금이라 서버는 입금 여부를
 * 알 수 없어, 실제로 입금한 손님이 이 상태에 빠지면 환불 처리 수단이 없습니다. 그 예외 구제를
 * 관리자에게만 열어둔 API입니다.
 */
@ApiTags("[관리자] 주문 관리")
@ApiExtraModels(
  AdminRefundCandidateListResponseDto,
  AdminRevertToRefundPendingRequestDto,
  OrderResponseDto,
  PaginationMetaResponseDto,
  UpdateOrderStatusResponseDto,
)
@Controller(`${AUDIENCE.ADMIN}/order-management`)
@Auth({ isPublic: false, audiences: [AUDIENCE.ADMIN] })
export class AdminOrderManagementController {
  constructor(private readonly orderService: OrderService) {}

  @Get("refund-candidates")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 환불 구제 대상 주문 목록 조회",
    description:
      "취소완료 주문 중 실제로 입금됐을 수 있는 건을 찾기 위한 목록입니다. 입금자명이 남은 주문과 입금 기한 만료로 자동 취소된 주문이 위로 정렬됩니다. onlyPaymentExpired로 만료 취소 건만, excludeReverted로 이미 되돌린 건을 제외해 조회할 수 있습니다.",
  })
  @SwaggerResponse(200, { dataDto: AdminRefundCandidateListResponseDto })
  @SwaggerAuthResponses()
  async listRefundCandidates(@Query() query: AdminRefundCandidateListRequestDto) {
    return await this.orderService.getRefundCandidatesForAdmin(query);
  }

  @Get("orders/:id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 주문 상세 조회",
    description:
      "소유권 제한 없이 주문을 조회합니다. 판매자·사용자 조회와 달리 주문 상태 자동 전환(입금 기한 만료 등)을 실행하지 않아, 조회만으로 주문이 바뀌지 않습니다.",
  })
  @SwaggerResponse(200, { dataDto: OrderResponseDto })
  @SwaggerAuthResponses()
  @SwaggerResponse(404, {
    dataExample: createMessageObject(ORDER_ERROR_MESSAGES.NOT_FOUND),
  })
  async getOrder(@Param("id") id: string) {
    return await this.orderService.getOrderByIdForAdmin(id);
  }

  @Patch("orders/:id/revert-to-refund-pending")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 취소완료 주문을 취소환불대기로 되돌리기",
    description:
      "취소완료(CANCEL_COMPLETED) 주문만 취소환불대기(CANCEL_REFUND_PENDING)로 되돌릴 수 있습니다. 환불 계좌는 비운 채 전환되며, 이후 구매자가 직접 입력합니다. 실제 환불 송금은 기존 취소환불대기 플로우에서 판매자가 진행합니다. 전환 시 구매자·판매자 모두에게 알림이 발송됩니다.",
  })
  @SwaggerResponse(200, { dataDto: UpdateOrderStatusResponseDto })
  @SwaggerAuthResponses()
  @SwaggerResponse(400, {
    dataExample: createMessageObject(ORDER_ERROR_MESSAGES.INVALID_STATUS_TRANSITION),
  })
  @SwaggerResponse(404, {
    dataExample: createMessageObject(ORDER_ERROR_MESSAGES.NOT_FOUND),
  })
  async revertToRefundPending(
    @Param("id") id: string,
    @Body() dto: AdminRevertToRefundPendingRequestDto,
  ) {
    return await this.orderService.revertOrderToRefundPendingForAdmin(id, dto);
  }
}
