import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { PaginationRequestDto } from "@apps/backend/common/dto/pagination-request.dto";
import { PaginationMetaResponseDto } from "@apps/backend/common/dto/pagination-response.dto";
import { OrderResponseDto } from "@apps/backend/modules/order/dto/order-detail.dto";

/**
 * 환불 구제 대상 주문 목록 조회 요청 (관리자)
 *
 * 취소완료(CANCEL_COMPLETED) 주문만 대상으로 합니다. 이 상태는 원래 되돌릴 수 없어서,
 * 실제로 입금했으나 환불받지 못한 손님을 찾아내는 것이 이 목록의 목적입니다.
 */
export class AdminRefundCandidateListRequestDto extends PaginationRequestDto {
  @ApiPropertyOptional({
    description:
      "true면 입금 기한 만료로 자동 취소된 주문만 조회합니다. 사용자·판매자가 의도한 취소보다 실제 입금 가능성이 높은 건들입니다.",
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === "true")
  @IsBoolean()
  onlyPaymentExpired?: boolean;

  @ApiPropertyOptional({
    description: "true면 이미 되돌린 주문은 제외합니다.",
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === "true")
  @IsBoolean()
  excludeReverted?: boolean;

  @ApiPropertyOptional({
    description: "(검색) 주문번호 부분 일치",
    example: "ORD-20240101",
  })
  @IsOptional()
  @IsString()
  orderNumber?: string;

  @ApiPropertyOptional({
    description: "(검색) 입금자명 부분 일치. 통장 내역의 입금자로 주문을 찾을 때 사용합니다.",
    example: "홍길동",
  })
  @IsOptional()
  @IsString()
  depositorName?: string;
}

/**
 * 환불 구제 대상 주문 목록 응답 (관리자). 판매자·사용자 목록과 동일한 `{ data, meta }` 형태입니다.
 */
export class AdminRefundCandidateListResponseDto {
  @ApiProperty({ description: "주문 목록", type: [OrderResponseDto] })
  data: OrderResponseDto[];

  @ApiProperty({ description: "페이지네이션 메타 정보", type: PaginationMetaResponseDto })
  meta: PaginationMetaResponseDto;
}

/**
 * 취소완료 → 취소환불대기 되돌리기 요청 (관리자)
 *
 * 환불 계좌는 여기서 받지 않습니다. 되돌린 뒤 손님이 직접 입력합니다.
 */
export class AdminRevertToRefundPendingRequestDto {
  @ApiProperty({
    description: "되돌리는 사유 (감사 기록용). 예: 고객 입금 확인됨 - 통장 내역 대조 완료",
    example: "고객 입금 확인됨 - 통장 내역 대조 완료",
    maxLength: 2000,
  })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  reason: string;
}
