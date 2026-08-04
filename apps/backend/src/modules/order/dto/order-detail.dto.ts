import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  OrderMyReviewUiStatus,
  OrderStatus,
} from "@apps/backend/modules/order/constants/order.constants";
import { SWAGGER_EXAMPLES } from "@apps/backend/modules/order/constants/order.constants";
import { PickupAddressDto } from "@apps/backend/modules/product/dto/product-common.dto";
import { StoreBankName } from "@apps/backend/modules/store/constants/store.constants";
import { RefundCancellationPolicyDto } from "@apps/backend/modules/store/dto/store-refund-cancellation-policy.dto";

/**
 * 주문 항목 응답 DTO
 */
export class OrderItemResponseDto {
  @ApiProperty({
    description: "주문 항목 ID",
    example: SWAGGER_EXAMPLES.ORDER_ITEM.id,
  })
  id: string;

  // 사이즈 옵션 정보 (옵션이 없는 상품의 경우 null)
  @ApiPropertyOptional({
    description: "선택한 사이즈 옵션 ID (사이즈 옵션이 없는 상품의 경우 null)",
    example: SWAGGER_EXAMPLES.ORDER_ITEM.sizeId,
  })
  sizeId?: string;

  @ApiPropertyOptional({
    description: "선택한 사이즈 표시명 (사이즈 옵션이 없는 상품의 경우 null)",
    example: SWAGGER_EXAMPLES.ORDER_ITEM.sizeDisplayName,
  })
  sizeDisplayName?: string;

  @ApiPropertyOptional({
    description: "선택한 사이즈 길이 (cm 단위, 사이즈 옵션이 없는 상품의 경우 null)",
    example: SWAGGER_EXAMPLES.ORDER_ITEM.sizeLengthCm,
  })
  sizeLengthCm?: number;

  @ApiPropertyOptional({
    description: "선택한 사이즈 설명",
    example: SWAGGER_EXAMPLES.ORDER_ITEM.sizeDescription,
  })
  sizeDescription?: string;

  @ApiPropertyOptional({
    description: "사이즈 추가 가격 (사이즈 옵션이 없으면 0 또는 null)",
    example: SWAGGER_EXAMPLES.ORDER_ITEM.sizePrice,
  })
  sizePrice?: number;

  // 맛 옵션 정보 (옵션이 없는 상품의 경우 null)
  @ApiPropertyOptional({
    description: "선택한 맛 옵션 ID (맛 옵션이 없는 상품의 경우 null)",
    example: SWAGGER_EXAMPLES.ORDER_ITEM.flavorId,
  })
  flavorId?: string;

  @ApiPropertyOptional({
    description: "선택한 맛 표시명 (맛 옵션이 없는 상품의 경우 null)",
    example: SWAGGER_EXAMPLES.ORDER_ITEM.flavorDisplayName,
  })
  flavorDisplayName?: string;

  @ApiPropertyOptional({
    description: "맛 추가 가격 (맛 옵션이 없으면 0 또는 null)",
    example: SWAGGER_EXAMPLES.ORDER_ITEM.flavorPrice,
  })
  flavorPrice?: number;

  @ApiPropertyOptional({
    description: "레터링 메시지",
    example: SWAGGER_EXAMPLES.ORDER_ITEM.letteringMessage,
  })
  letteringMessage?: string;

  @ApiPropertyOptional({
    description: "요청 사항",
    example: SWAGGER_EXAMPLES.ORDER_ITEM.requestMessage,
  })
  requestMessage?: string;

  @ApiProperty({
    description: "수량",
    example: SWAGGER_EXAMPLES.ORDER_ITEM.quantity,
  })
  quantity: number;

  @ApiProperty({
    description: "개별 항목 가격 (기본 가격 + 사이즈 추가 가격 + 맛 추가 가격)",
    example: SWAGGER_EXAMPLES.ORDER_ITEM.itemPrice,
  })
  itemPrice: number;

  @ApiProperty({
    description: "업로드한 이미지 URL 목록",
    example: SWAGGER_EXAMPLES.ORDER_ITEM.imageUrls,
    type: [String],
  })
  imageUrls: string[];

  @ApiProperty({
    description: "생성일시",
    example: SWAGGER_EXAMPLES.ORDER_ITEM.createdAt,
  })
  createdAt: Date;

  @ApiProperty({
    description: "수정일시",
    example: SWAGGER_EXAMPLES.ORDER_ITEM.updatedAt,
  })
  updatedAt: Date;
}

/**
 * 주문 응답 DTO
 */
export class OrderResponseDto extends PickupAddressDto {
  @ApiProperty({
    description: "주문 ID",
    example: SWAGGER_EXAMPLES.ORDER_DATA.id,
  })
  id: string;

  @ApiProperty({
    description: "사용자 ID",
    example: SWAGGER_EXAMPLES.ORDER_DATA.userId,
  })
  userId: string;

  @ApiProperty({
    description: "상품 ID",
    example: SWAGGER_EXAMPLES.ORDER_DATA.productId,
  })
  productId: string;

  @ApiProperty({
    description: "상품명",
    example: SWAGGER_EXAMPLES.ORDER_DATA.productName,
  })
  productName: string;

  @ApiProperty({
    description: "상품 이미지 URL 목록",
    example: SWAGGER_EXAMPLES.ORDER_DATA.productImages,
    type: [String],
  })
  productImages: string[];

  @ApiProperty({
    description: "스토어 ID",
    example: SWAGGER_EXAMPLES.ORDER_DATA.storeId,
  })
  storeId: string;

  @ApiProperty({
    description: "스토어명",
    example: SWAGGER_EXAMPLES.ORDER_DATA.storeName,
  })
  storeName: string;

  @ApiPropertyOptional({
    description: "스토어 연락처(전화/휴대폰). 미등록 시 null",
    example: SWAGGER_EXAMPLES.ORDER_DATA.storePhoneNumber,
    nullable: true,
  })
  storePhoneNumber: string | null;

  @ApiPropertyOptional({
    description: "스토어 카카오채널 ID. 미등록 시 null",
    example: SWAGGER_EXAMPLES.ORDER_DATA.storeKakaoChannelId,
    nullable: true,
  })
  storeKakaoChannelId: string | null;

  @ApiPropertyOptional({
    description: "스토어 인스타그램 ID. 미등록 시 null",
    example: SWAGGER_EXAMPLES.ORDER_DATA.storeInstagramId,
    nullable: true,
  })
  storeInstagramId: string | null;

  @ApiPropertyOptional({
    description: "스토어 정산 계좌 은행 코드 (스토어에 미등록 시 null)",
    enum: StoreBankName,
    nullable: true,
  })
  storeBankName: StoreBankName | null;

  @ApiPropertyOptional({
    description: "스토어 정산 계좌번호 (스토어에 미등록 시 null)",
    nullable: true,
  })
  storeBankAccountNumber: string | null;

  @ApiPropertyOptional({
    description: "스토어 정산 계좌 예금주명 (스토어에 미등록 시 null)",
    nullable: true,
  })
  storeAccountHolderName: string | null;

  @ApiProperty({
    description:
      "주문 조회 시점 스토어에 등록된 환불·취소 규정(스토어 `refund_cancellation_policy` JSON과 동일 구조). 주문 생성 시점 스냅샷이 아닙니다.",
    type: RefundCancellationPolicyDto,
    example: SWAGGER_EXAMPLES.ORDER_DATA.storeRefundCancellationPolicy,
  })
  storeRefundCancellationPolicy: RefundCancellationPolicyDto;

  @ApiProperty({
    description: "주문 번호",
    example: SWAGGER_EXAMPLES.ORDER_DATA.orderNumber,
  })
  orderNumber: string;

  @ApiProperty({
    description: "총 수량",
    example: SWAGGER_EXAMPLES.ORDER_DATA.totalQuantity,
  })
  totalQuantity: number;

  @ApiProperty({
    description: "총 금액",
    example: SWAGGER_EXAMPLES.ORDER_DATA.totalPrice,
  })
  totalPrice: number;

  @ApiProperty({
    description: "픽업 날짜 및 시간",
    example: SWAGGER_EXAMPLES.ORDER_DATA.pickupDate,
  })
  pickupDate: Date;

  // 픽업장소 정보는 PickupAddressDto 상속

  @ApiProperty({
    description: "주문 상태",
    enum: OrderStatus,
    example: SWAGGER_EXAMPLES.ORDER_DATA.orderStatus,
  })
  orderStatus: OrderStatus;

  @ApiPropertyOptional({
    description: "입금대기로 전환된 시각. 입금 유효 기준 시작점(예약신청 단계에서는 null)",
    nullable: true,
  })
  paymentPendingAt: Date | null;

  @ApiPropertyOptional({
    description:
      "입금 마감 시각(픽업까지 남은 시간에 따라 최대 12h/6h/1h 중 적용 후 픽업 시각과 비교한 값). 입금대기가 아니면 null",
    nullable: true,
  })
  paymentPendingDeadlineAt: Date | null;

  @ApiPropertyOptional({
    description: "사용자가 입금완료 처리 시 입력한 입금자명. 미입력 상태 주문은 null",
    example: "홍길동",
    nullable: true,
  })
  depositorName: string | null;

  @ApiPropertyOptional({
    description:
      "입금 기한 만료로 자동 취소된 시각. 값이 있으면 사용자·판매자가 의도한 취소가 아니라 시스템이 취소한 건입니다. 그 외에는 null",
    example: "2024-01-15T14:00:00.000Z",
    nullable: true,
  })
  paymentPendingExpiredAt: Date | null;

  @ApiPropertyOptional({
    description: "주문 시 선택 입력한 예약자명. 미입력 시 null",
    example: SWAGGER_EXAMPLES.ORDER_DATA.reservationContactName,
    nullable: true,
  })
  reservationContactName: string | null;

  @ApiPropertyOptional({
    description: "주문 시 선택 입력한 예약 연락처(휴대폰, 숫자만). 미입력 시 null",
    example: SWAGGER_EXAMPLES.ORDER_DATA.reservationPhone,
    nullable: true,
  })
  reservationPhone: string | null;

  @ApiPropertyOptional({
    description:
      "입금 전 사용자 취소 시 입력한 사유. 자동 만료 취소·판매자 취소 등에서는 null일 수 있음",
    example: "일정 변경",
    nullable: true,
  })
  userCancelReason: string | null;

  @ApiPropertyOptional({
    description: "판매자가 입금대기에서 예약 취소(취소완료) 시 입력한 사유. 해당 없으면 null",
    example: "재고 부족",
    nullable: true,
  })
  sellerCancelReason: string | null;

  @ApiPropertyOptional({
    description: "판매자가 픽업대기에서 노쇼 처리 시 입력한 사유. 해당 없으면 null",
    example: "픽업 시간 경과 후 연락 불가",
    nullable: true,
  })
  sellerNoShowReason: string | null;

  @ApiPropertyOptional({
    description:
      "입금 이후 사용자가 취소·환불 요청 API로 전환할 때 입력한 사유. 판매자가 직접 취소환불대기로 바꾼 경우는 `sellerCancelRefundPendingReason`을 봅니다.",
    example: "일정 변경",
    nullable: true,
  })
  refundRequestReason: string | null;

  @ApiPropertyOptional({
    description:
      "판매자가 취소환불대기로 전환할 때 입력한 사유. 사용자 취소·환불 요청 사유(`refundRequestReason`)와 별도 필드입니다.",
    example: "고객 요청에 따른 환불 진행",
    nullable: true,
  })
  sellerCancelRefundPendingReason: string | null;

  @ApiPropertyOptional({
    description:
      "관리자가 취소완료 주문을 취소환불대기로 되돌릴 때 입력한 사유. 되돌린 적이 없으면 null",
    example: "고객 입금 확인됨 - 통장 내역 대조 완료",
    nullable: true,
  })
  adminRefundRevertReason: string | null;

  @ApiPropertyOptional({
    description:
      "관리자가 취소완료 주문을 취소환불대기로 되돌린 시각. 값이 있으면 예외 구제된 주문입니다.",
    example: "2024-01-15T14:00:00.000Z",
    nullable: true,
  })
  adminRefundRevertedAt: Date | null;

  @ApiPropertyOptional({
    description: "환불받을 은행 (취소·환불 요청 시). 해당 없으면 null",
    enum: StoreBankName,
    nullable: true,
  })
  refundBankName: StoreBankName | null;

  @ApiPropertyOptional({
    description: "환불 계좌번호. 해당 없으면 null",
    nullable: true,
  })
  refundBankAccountNumber: string | null;

  @ApiPropertyOptional({
    description: "환불 예금주명. 해당 없으면 null",
    nullable: true,
  })
  refundAccountHolderName: string | null;

  @ApiProperty({
    description: "생성일시",
    example: SWAGGER_EXAMPLES.ORDER_DATA.createdAt,
  })
  createdAt: Date;

  @ApiProperty({
    description: "수정일시",
    example: SWAGGER_EXAMPLES.ORDER_DATA.updatedAt,
  })
  updatedAt: Date;

  @ApiProperty({
    description: "주문 항목 목록",
    type: [OrderItemResponseDto],
  })
  orderItems: OrderItemResponseDto[];

  @ApiProperty({
    description:
      "사용자 앱 후기 UI 분기: 작성 가능 / 작성 완료(후기 보기) / 삭제로 재작성 불가 / 해당 없음(픽업 전·취소 등)",
    enum: OrderMyReviewUiStatus,
    example: OrderMyReviewUiStatus.NOT_AVAILABLE,
  })
  myReviewUiStatus: OrderMyReviewUiStatus;

  @ApiProperty({
    description:
      "`myReviewUiStatus`가 WRITTEN일 때만 값 있음. 상품 후기 상세·내 후기 목록 등으로 이동할 때 사용",
    example: "clx_review_example_id",
    nullable: true,
  })
  linkedProductReviewId: string | null;
}
