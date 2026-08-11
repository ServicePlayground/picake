import { ApiProperty } from "@nestjs/swagger";
import { PaginationMetaResponseDto } from "@apps/backend/common/dto/pagination-response.dto";
import {
  SWAGGER_EXAMPLES,
  MessageSenderType,
} from "@apps/backend/modules/chat/constants/chat.constants";

/**
 * 메시지 응답 DTO
 */
export class MessageResponseDto {
  @ApiProperty({
    description: "메시지 ID",
    example: SWAGGER_EXAMPLES.MESSAGE_ID,
  })
  id: string;

  @ApiProperty({
    description: "채팅방 ID",
    example: SWAGGER_EXAMPLES.ROOM_ID,
  })
  roomId: string;

  @ApiProperty({
    description: "메시지 내용",
    example: SWAGGER_EXAMPLES.LAST_MESSAGE,
  })
  text: string;

  @ApiProperty({
    description: "발신자 ID",
    example: SWAGGER_EXAMPLES.USER_ID,
  })
  senderId: string;

  @ApiProperty({
    description: "발신자 타입",
    enum: MessageSenderType,
    example: MessageSenderType.CONSUMER,
  })
  senderType: MessageSenderType;

  @ApiProperty({
    description: "AI가 생성한 메시지 여부 (senderType은 store 유지, 화면 뱃지 구분용)",
    example: false,
  })
  isAiGenerated: boolean;

  @ApiProperty({
    description: 'AI가 "모르겠어요, 연결해드릴까요?"라고 답한 메시지 여부 (quick-reply 렌더 근거)',
    example: false,
  })
  aiSuggestsHandoff: boolean;

  @ApiProperty({
    description: "AI 답변 만족도 피드백 (isAiGenerated=true 메시지만)",
    enum: ["POSITIVE", "NEGATIVE"],
    nullable: true,
    example: null,
  })
  aiFeedback: "POSITIVE" | "NEGATIVE" | null;

  @ApiProperty({
    description: "상품 상세에서 시작된 문의 메시지의 상품 ID (메시지 단위 컨텍스트)",
    nullable: true,
    example: null,
  })
  productId: string | null;

  @ApiProperty({
    description: "커스텀 주문 요청/견적 카드 렌더링용 요청 ID",
    nullable: true,
    example: null,
  })
  relatedCustomOrderRequestId: string | null;

  @ApiProperty({
    description: "생성일시",
    example: SWAGGER_EXAMPLES.CREATED_AT,
  })
  createdAt: Date;
}

/**
 * 메시지 목록 응답 DTO
 */
export class MessageListResponseDto {
  @ApiProperty({
    description: "메시지 목록",
    type: [MessageResponseDto],
  })
  data: MessageResponseDto[];

  @ApiProperty({
    description: "페이지네이션 메타 정보",
    type: PaginationMetaResponseDto,
  })
  meta: PaginationMetaResponseDto;
}
