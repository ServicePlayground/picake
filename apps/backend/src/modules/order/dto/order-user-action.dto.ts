import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from "class-validator";
import { StoreBankName } from "@apps/backend/modules/store/constants/store.constants";
import {
  IsValidAccountHolderName,
  IsValidBankAccountNumber,
} from "@apps/backend/modules/store/decorators/validators.decorator";

/**
 * 입금 전 예약 취소 요청 (사용자)
 */
export class CancelOrderBeforePaymentRequestDto {
  @ApiProperty({
    description: "취소 사유",
    example: "일정이 변경되어 취소합니다.",
    maxLength: 2000,
  })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  reason: string;

  @ApiPropertyOptional({
    description:
      "이미 입금했다고 사용자가 신고한 경우 true. 무통장입금이라 서버는 입금 여부를 알 수 없어 자기신고에 의존합니다. true면 취소완료가 아니라 취소환불대기로 전환되며, 환불 계좌 3종이 함께 필요합니다. 입금대기(PAYMENT_PENDING) 상태에서만 사용할 수 있습니다.",
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  hasDeposited?: boolean;

  @ApiPropertyOptional({
    description: "환불받을 은행 (`hasDeposited`가 true일 때 필수)",
    enum: StoreBankName,
    example: StoreBankName.KB_KOOKMIN,
  })
  @ValidateIf((dto: CancelOrderBeforePaymentRequestDto) => dto.hasDeposited === true)
  @IsEnum(StoreBankName)
  bankName?: StoreBankName;

  @ApiPropertyOptional({
    description: "환불 계좌번호 (`hasDeposited`가 true일 때 필수)",
    example: "110-302-1234567",
  })
  @ValidateIf((dto: CancelOrderBeforePaymentRequestDto) => dto.hasDeposited === true)
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @IsValidBankAccountNumber()
  bankAccountNumber?: string;

  @ApiPropertyOptional({
    description: "예금주명 (`hasDeposited`가 true일 때 필수)",
    example: "홍길동",
  })
  @ValidateIf((dto: CancelOrderBeforePaymentRequestDto) => dto.hasDeposited === true)
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @IsValidAccountHolderName()
  accountHolderName?: string;
}

/**
 * 입금완료 요청 (사용자)
 */
export class MarkPaymentCompleteRequestDto {
  @ApiProperty({
    description: "입금자명 (예금주명 형식과 동일 검증)",
    example: "홍길동",
  })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @IsValidAccountHolderName()
  depositorName: string;
}

/**
 * 환불 계좌 입력 (사용자) — 이미 취소환불대기인 주문에 계좌만 채웁니다.
 *
 * 관리자가 취소완료 주문을 되돌린 경우 환불 계좌가 비어 있습니다. 그때 손님이 직접 입력하는 용도라
 * 상태는 바꾸지 않고 계좌 3종만 갱신합니다. (취소·환불 "요청"은 `RequestCancelRefundRequestDto`)
 */
export class SubmitRefundAccountRequestDto {
  @ApiProperty({
    description: "환불받을 은행 (정산 계좌 은행 코드와 동일)",
    enum: StoreBankName,
    example: StoreBankName.KB_KOOKMIN,
  })
  @IsEnum(StoreBankName)
  bankName: StoreBankName;

  @ApiProperty({
    description: "환불 계좌번호 (숫자·하이픈·공백, 4~30자)",
    example: "110-302-1234567",
  })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @IsValidBankAccountNumber()
  bankAccountNumber: string;

  @ApiProperty({
    description: "예금주명 (한글·영문·숫자·공백, 2~30자)",
    example: "홍길동",
  })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @IsValidAccountHolderName()
  accountHolderName: string;
}

/**
 * 입금 완료 이후 취소·환불 요청 (사용자) — 사유 + 환불 계좌 (스토어 정산 계좌와 동일 검증)
 */
export class RequestCancelRefundRequestDto {
  @ApiProperty({
    description: "취소·환불 사유",
    example: "일정 변경으로 취소합니다.",
    maxLength: 2000,
  })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  reason: string;

  @ApiProperty({
    description: "환불받을 은행 (정산 계좌 은행 코드와 동일)",
    enum: StoreBankName,
    example: StoreBankName.KB_KOOKMIN,
  })
  @IsEnum(StoreBankName)
  bankName: StoreBankName;

  @ApiProperty({
    description: "환불 계좌번호 (숫자·하이픈·공백, 4~30자)",
    example: "110-302-1234567",
  })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @IsValidBankAccountNumber()
  bankAccountNumber: string;

  @ApiProperty({
    description: "예금주명 (한글·영문·숫자·공백, 2~30자)",
    example: "홍길동",
  })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @IsValidAccountHolderName()
  accountHolderName: string;
}
