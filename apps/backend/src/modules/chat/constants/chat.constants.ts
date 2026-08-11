import { SWAGGER_EXAMPLES as USER_SWAGGER_EXAMPLES } from "@apps/backend/modules/auth/constants/auth.constants";
import { SWAGGER_EXAMPLES as STORE_SWAGGER_EXAMPLES } from "@apps/backend/modules/store/constants/store.constants";

export const CHAT_ERROR_MESSAGES = {
  STORE_NOT_FOUND: "스토어를 찾을 수 없습니다.",
  STORE_NOT_OWNED: "해당 스토어에 대한 권한이 없습니다.",
  CHAT_ROOM_NOT_FOUND: "채팅방을 찾을 수 없습니다.",
} as const;

export const CHAT_SUCCESS_MESSAGES = {
  CHAT_ROOM_CREATED: "채팅방이 생성되었습니다.",
} as const;

/**
 * 메시지 발신자 타입 enum
 */
export enum MessageSenderType {
  CONSUMER = "consumer",
  STORE = "store",
  SYSTEM = "system",
}

/** SYSTEM 메시지의 고정 발신자 ID (Message.senderId가 필수 필드이므로 상수 사용) */
export const SYSTEM_SENDER_ID = "system";

export const SWAGGER_EXAMPLES = {
  ID: "QXZw02vBqVXNQ29c4w9n9ZdG",
  STORE_ID: STORE_SWAGGER_EXAMPLES.ID,
  USER_ID: USER_SWAGGER_EXAMPLES.CONSUMER_DATA.id,
  MESSAGE_ID: "cm1234567890",
  ROOM_ID: "cm0987654321",
  LAST_MESSAGE: "안녕하세요, 케이크 주문하고 싶어요.",
  LAST_MESSAGE_AT: new Date("2024-01-01T12:00:00.000Z"),
  USER_UNREAD: 2,
  STORE_UNREAD: 0,
  CREATED_AT: new Date("2024-01-01T00:00:00.000Z"),
  UPDATED_AT: new Date("2024-01-01T12:00:00.000Z"),
};
