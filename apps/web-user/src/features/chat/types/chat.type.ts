import { PaginationMeta } from "@/apps/web-user/common/types/api.type";

// 채팅방 스토어 정보 (사용자용)
export interface ChatRoomStore {
  id: string;
  name: string;
  logoImageUrl: string | null;
}

// 채팅방 정보 (사용자용)
export interface ChatRoom {
  id: string;
  store: ChatRoomStore;
  lastMessage: string | null;
  lastMessageAt: Date | null;
  userUnread: number;
  storeUnread: number;
  createdAt: Date;
  updatedAt: Date;
}

// 채팅방 목록 응답 (사용자용)
export interface ChatRoomListResponse {
  data: ChatRoom[];
  meta: PaginationMeta;
}

// 채팅방 생성/ 조회 요청
export interface CreateChatRoomRequest {
  storeId: string;
}

// 채팅방 생성/ 조회 응답
export interface CreateChatRoomResponse {
  id: string;
}

/**
 * 채팅방 목록 조회 쿼리 키용 파라미터 (page 제외)
 */
export interface GetChatRoomsParams {
  limit: number;
}

/**
 * 채팅방 목록 조회 요청 파라미터
 */
export interface GetChatRoomsRequest extends GetChatRoomsParams {
  page: number;
}

/**
 * 메시지 목록 조회 쿼리 키용 파라미터 (page 제외)
 */
export interface GetMessagesParams {
  limit: number;
}

/**
 * 메시지 목록 조회 요청 파라미터
 */
export interface GetMessagesRequest extends GetMessagesParams {
  page: number;
}

export type MessageSenderType = "consumer" | "store" | "system";

export type AiMessageFeedback = "POSITIVE" | "NEGATIVE";

// 메시지 정보
export interface Message {
  id: string;
  roomId: string;
  text: string;
  senderId: string;
  senderType: MessageSenderType;
  /** AI가 생성한 답변 (senderType은 store 유지 — 손님에게도 AI임을 표시) */
  isAiGenerated: boolean;
  /** AI가 "모르겠어요, 연결해드릴까요?"라고 답한 메시지 — 이때만 연결 버튼 노출 */
  aiSuggestsHandoff: boolean;
  aiFeedback: AiMessageFeedback | null;
  productId: string | null;
  relatedCustomOrderRequestId: string | null;
  createdAt: Date;
}

// 페이지네이션 메타 정보
export interface MessagePaginationMeta {
  currentPage: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// 메시지 목록 응답
export interface MessageListResponse {
  messages: Message[];
  meta: MessagePaginationMeta;
}

// 메시지 전송 요청
export interface SendMessageRequest {
  text: string;
}
