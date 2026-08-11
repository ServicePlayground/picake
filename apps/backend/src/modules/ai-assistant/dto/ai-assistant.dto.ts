import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional, IsIn, MaxLength } from "class-validator";

/** AI 자동응답 설정 저장 요청 */
export class UpdateAiAssistantSettingsRequestDto {
  @ApiPropertyOptional({ description: "응대 지침 자유 텍스트", example: "안녕하세요, 단모니 베이커리입니다..." })
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  instructions?: string;

  @ApiPropertyOptional({
    description: "AI 사용 시간대 (미전달 시 기존값 유지, row 최초 생성 시 기본 OFF)",
    enum: ["ALWAYS", "OUTSIDE_BUSINESS_HOURS", "OFF"],
  })
  @IsOptional()
  @IsIn(["ALWAYS", "OUTSIDE_BUSINESS_HOURS", "OFF"])
  scheduleMode?: "ALWAYS" | "OUTSIDE_BUSINESS_HOURS" | "OFF";
}

/** FAQ 생성/수정 요청 */
export class UpsertAiFaqRequestDto {
  @ApiProperty({ description: "질문", example: "당일 주문도 가능한가요?" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  question: string;

  @ApiProperty({ description: "답변", example: "당일은 재고에 따라 다릅니다. 전화로 확인 부탁드려요!" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  answer: string;
}

export class UpdateAiFaqRequestDto {
  @ApiPropertyOptional({ description: "질문" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  question?: string;

  @ApiPropertyOptional({ description: "답변" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  answer?: string;
}

/** 미답변 질문 → FAQ 등록 요청 */
export class ConvertToFaqRequestDto {
  @ApiPropertyOptional({ description: "답변 (미전달 시 캡처된 판매자 답변 초안 사용)" })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  answer?: string;
}

/** 저장 전 미리테스트 요청 */
export class AiPreviewTestRequestDto {
  @ApiProperty({ description: "테스트 질문", example: "환불은 며칠 전까지 가능해요?" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  question: string;

  @ApiPropertyOptional({ description: "저장 전 지침 초안 (전달 시 저장된 지침 대신 사용)" })
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  instructions?: string;
}

/** 응대중 토글 요청 */
export class ToggleAiRequestDto {
  @ApiProperty({ description: "이 방의 AI 자동응답 활성 여부", example: false })
  @IsIn([true, false])
  enabled: boolean;
}

/** AI 메시지 피드백 요청 */
export class AiMessageFeedbackRequestDto {
  @ApiProperty({ description: "피드백", enum: ["positive", "negative"] })
  @IsIn(["positive", "negative"])
  rating: "positive" | "negative";
}

/** 채팅 메시지 전송 요청 (REST — 상품 컨텍스트 첨부 가능) */
export class SendChatMessageRequestDto {
  @ApiProperty({ description: "메시지 내용", example: "안녕하세요! 영업시간이 어떻게 되나요?" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  text: string;

  @ApiPropertyOptional({ description: "상품 상세에서 시작된 문의의 상품 ID (첫 메시지에만)" })
  @IsOptional()
  @IsString()
  productId?: string;
}
