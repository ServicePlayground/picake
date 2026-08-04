import { Injectable } from "@nestjs/common";
import { OrderCreateService } from "@apps/backend/modules/order/services/order-create.service";
import { OrderDetailService } from "@apps/backend/modules/order/services/order-detail.service";
import { OrderSellerListService } from "@apps/backend/modules/order/services/order-seller-list.service";
import { OrderSellerActionService } from "@apps/backend/modules/order/services/order-seller-action.service";
import { OrderUserListService } from "@apps/backend/modules/order/services/order-user-list.service";
import { OrderUserActionService } from "@apps/backend/modules/order/services/order-user-action.service";
import { OrderUserReservationEditService } from "@apps/backend/modules/order/services/order-user-reservation-edit.service";
import { OrderAdminActionService } from "@apps/backend/modules/order/services/order-admin-action.service";
import {
  AdminRefundCandidateListRequestDto,
  AdminRefundCandidateListResponseDto,
  AdminRevertToRefundPendingRequestDto,
} from "@apps/backend/modules/order/dto/order-admin-action.dto";
import {
  CreateOrderRequestDto,
  CreateOrderResponseDto,
} from "@apps/backend/modules/order/dto/order-create.dto";
import { OrderResponseDto } from "@apps/backend/modules/order/dto/order-detail.dto";
import {
  OrderListResponseDto,
  OrderListRequestDto,
} from "@apps/backend/modules/order/dto/order-list.dto";
import { UpdateOrderStatusRequestDto } from "./dto/order-seller-action.dto";
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
import { JwtVerifiedPayload } from "@apps/backend/modules/auth/types/auth.types";

/**
 * 주문 서비스
 *
 * 모든 주문 관련 기능을 통합하여 제공하는 메인 서비스입니다.
 * OrderCreateService와 OrderDetailService를 조합하여 사용합니다.
 */
@Injectable()
export class OrderService {
  constructor(
    private readonly orderCreateService: OrderCreateService,
    private readonly orderDetailService: OrderDetailService,
    private readonly orderSellerListService: OrderSellerListService,
    private readonly orderSellerActionService: OrderSellerActionService,
    private readonly orderUserListService: OrderUserListService,
    private readonly orderUserActionService: OrderUserActionService,
    private readonly orderUserReservationEditService: OrderUserReservationEditService,
    private readonly orderAdminActionService: OrderAdminActionService,
  ) {}

  /**
   * 주문 생성 (사용자용)
   */
  async createOrderForUser(
    createOrderDto: CreateOrderRequestDto,
    user: JwtVerifiedPayload,
  ): Promise<CreateOrderResponseDto> {
    return this.orderCreateService.createOrderForUser(user.sub, createOrderDto);
  }

  /**
   * 주문 상세조회 (사용자용)
   */
  async getOrderByIdForUser(orderId: string, user: JwtVerifiedPayload): Promise<OrderResponseDto> {
    return this.orderDetailService.getOrderByIdForUser(orderId, user.sub);
  }

  /**
   * 주문 목록 조회 (사용자용)
   */
  async getUserOrdersForUser(
    query: OrderListRequestDto,
    user: JwtVerifiedPayload,
  ): Promise<OrderListResponseDto> {
    return this.orderUserListService.getUserOrdersForUser(query, user.sub);
  }

  /**
   * 주문 상세조회 (판매자용)
   */
  async getOrderByIdForSeller(
    orderId: string,
    user: JwtVerifiedPayload,
  ): Promise<OrderResponseDto> {
    return this.orderDetailService.getOrderByIdForSeller(orderId, user.sub);
  }

  /**
   * 주문 목록 조회 (판매자용)
   */
  async getOrdersForSeller(
    query: OrderListRequestDto,
    user: JwtVerifiedPayload,
  ): Promise<OrderListResponseDto> {
    return this.orderSellerListService.getOrdersForSeller(query, user);
  }

  /**
   * 주문 상태 변경 (판매자용)
   */
  async updateOrderStatusForSeller(
    orderId: string,
    updateDto: UpdateOrderStatusRequestDto,
    user: JwtVerifiedPayload,
  ): Promise<{ id: string }> {
    return this.orderSellerActionService.updateOrderStatusForSeller(orderId, updateDto, user.sub);
  }

  /** 입금완료 처리 (사용자) */
  async markOrderPaymentCompletedForUser(
    orderId: string,
    user: JwtVerifiedPayload,
    dto: MarkPaymentCompleteRequestDto,
  ): Promise<{ id: string }> {
    return this.orderUserActionService.markPaymentCompleted(orderId, user.sub, dto);
  }

  /** 입금 전 예약 취소 (사용자) */
  async cancelOrderBeforePaymentForUser(
    orderId: string,
    user: JwtVerifiedPayload,
    dto: CancelOrderBeforePaymentRequestDto,
  ): Promise<{ id: string }> {
    return this.orderUserActionService.cancelBeforePayment(orderId, user.sub, dto);
  }

  /** 입금 후 취소환불 요청 (사용자) */
  async requestOrderRefundForUser(
    orderId: string,
    user: JwtVerifiedPayload,
    dto: RequestCancelRefundRequestDto,
  ): Promise<{ id: string }> {
    return this.orderUserActionService.requestRefund(orderId, user.sub, dto);
  }

  /** 예약신청 단계 픽업일 변경 (사용자) */
  async updateReservationPickupDateForUser(
    orderId: string,
    user: JwtVerifiedPayload,
    dto: UpdateReservationPickupDateRequestDto,
  ): Promise<{ id: string }> {
    return this.orderUserReservationEditService.updatePickupDate(orderId, user.sub, dto);
  }

  /** 예약신청 단계 주문 항목(옵션) 변경 (사용자) */
  async updateReservationOrderItemsForUser(
    orderId: string,
    user: JwtVerifiedPayload,
    dto: UpdateReservationOrderItemsRequestDto,
  ): Promise<{ id: string }> {
    return this.orderUserReservationEditService.updateOrderItems(orderId, user.sub, dto);
  }

  /** 취소환불대기 주문에 환불 계좌 입력 (사용자) */
  async submitRefundAccountForUser(
    orderId: string,
    user: JwtVerifiedPayload,
    dto: SubmitRefundAccountRequestDto,
  ): Promise<{ id: string }> {
    return this.orderUserActionService.submitRefundAccount(orderId, user.sub, dto);
  }

  /** 환불 구제가 필요할 수 있는 취소완료 주문 목록 (관리자) */
  async getRefundCandidatesForAdmin(
    query: AdminRefundCandidateListRequestDto,
  ): Promise<AdminRefundCandidateListResponseDto> {
    return this.orderAdminActionService.listRefundCandidates(query);
  }

  /** 주문 상세조회 (관리자) */
  async getOrderByIdForAdmin(orderId: string): Promise<OrderResponseDto> {
    return this.orderAdminActionService.getOrderById(orderId);
  }

  /** 취소완료 → 취소환불대기 되돌리기 (관리자) */
  async revertOrderToRefundPendingForAdmin(
    orderId: string,
    dto: AdminRevertToRefundPendingRequestDto,
  ): Promise<{ id: string }> {
    return this.orderAdminActionService.revertToRefundPending(orderId, dto);
  }
}
