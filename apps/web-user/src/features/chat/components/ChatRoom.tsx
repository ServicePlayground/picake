"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { chatApi } from "@/apps/web-user/features/chat/apis/chat.api";
import {
  useMessages,
  useMarkChatRoomAsRead,
  useRequestHuman,
  useSetMessageFeedback,
} from "@/apps/web-user/features/chat/hooks/queries/useChat";
import { CustomOrderRequestCard } from "@/apps/web-user/features/custom-order/components/CustomOrderRequestCard";
import { chatSocketService } from "@/apps/web-user/features/chat/services/chat-socket.service";
import { Message } from "@/apps/web-user/features/chat/types/chat.type";
import { Send } from "lucide-react";
import { formatTime } from "@/apps/web-user/common/utils/date.util";
import { useInfiniteScroll } from "@/apps/web-user/common/hooks/useInfiniteScroll";
import { flattenAndDeduplicateInfiniteData } from "@/apps/web-user/common/utils/pagination.util";
import { EmptyState } from "@/apps/web-user/common/components/fallbacks/EmptyState";

export const ChatRoom: React.FC = () => {
  const params = useParams();
  const roomId = params?.roomId as string;
  const {
    data: messagesData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMessages(roomId, 50);
  const [initialAllMessages, setInitialAllMessages] = useState<Message[]>([]); // API를 통해 조회된 메시지 목록
  const [newAllMessages, setNewAllMessages] = useState<Message[]>([]); // websocket을 통해 수신된 새로운 메시지 목록
  const allMessages = useMemo(
    () => [...initialAllMessages, ...newAllMessages],
    [initialAllMessages, newAllMessages],
  );
  const [newMessage, setNewMessage] = useState(""); // 새로운 메시지 입력
  const markAsReadMutation = useMarkChatRoomAsRead();
  const requestHumanMutation = useRequestHuman();
  const feedbackMutation = useSetMessageFeedback();
  // 상품 상세에서 진입한 경우의 상품 컨텍스트 (첫 메시지에만 붙임)
  const searchParams = useSearchParams();
  const productId = searchParams?.get("productId") ?? undefined;
  const hasSentProductContext = useRef(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 무한 스크롤 훅 사용 (위로 스크롤하여 이전 메시지 로드)
  useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    loadMoreRef,
  });

  // 채팅방 접속이후 새롭게 작성된 메시지는 조회 REST API를 통해 가져오지 않음
  // 여기서는 초기, 무한스크롤시와 같이 messagesData이 변경될때만 초기화
  useEffect(() => {
    // 읽음 처리
    markAsReadMutation.mutate(roomId);

    const allMessages = flattenAndDeduplicateInfiniteData<Message>(messagesData);

    // REST API로 받은 메시지도 필수 필드 검증 및 정규화
    const validatedMessages = allMessages.map((msg) => ({
      ...msg,
      createdAt: msg.createdAt instanceof Date ? msg.createdAt : new Date(msg.createdAt),
    }));

    setInitialAllMessages(validatedMessages);
    setNewAllMessages([]);

    return () => {
      // 채팅방 나갈 때 읽음 처리
      markAsReadMutation.mutate(roomId);
    };
  }, [messagesData]);

  // WebSocket 연결 및 채팅방 조인
  useEffect(() => {
    if (!roomId) return;

    let unsubscribe: (() => void) | null = null;
    // 비동기로 연결 및 조인 처리
    const setupChat = async () => {
      try {
        await chatSocketService.connect();
        await chatSocketService.joinRoom(roomId);
        // 새 메시지 수신 리스너 (상대방이 WebSocket으로 메시지 전송 후 서버에서 자동으로 WebSocket 브로드캐스트하여 여기로 전달됨.)
        unsubscribe = await chatSocketService.onNewMessage((message: Message) => {
          // createdAt이 문자열인 경우 Date 객체로 변환
          const normalizedMessage: Message = {
            ...message,
            createdAt:
              message.createdAt instanceof Date ? message.createdAt : new Date(message.createdAt),
          };

          // 중복 메시지 제거: 같은 id를 가진 메시지가 이미 있으면 추가하지 않음
          setNewAllMessages((prev) => {
            const isDuplicate = prev.some((msg) => msg.id === normalizedMessage.id);
            if (isDuplicate) {
              return prev;
            }
            return [...prev, normalizedMessage];
          });
        });
      } catch (error) {
        console.error("Failed to setup chat:", error);
      }
    };

    setupChat();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      chatSocketService.leaveRoom(roomId);
    };
  }, [roomId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !roomId) return;

    try {
      if (productId && !hasSentProductContext.current) {
        // 상품 상세에서 시작한 문의의 첫 메시지는 REST로 보내 상품 컨텍스트를 붙인다
        // (AI가 해당 상품의 가격·판매 상태를 참고해 답할 수 있도록)
        hasSentProductContext.current = true;
        await chatApi.sendMessage(roomId, newMessage, productId);
      } else {
        // 이후 대화는 기존 WebSocket 경로 그대로
        await chatSocketService.sendMessage(roomId, newMessage);
      }
      setNewMessage("");
      // 서버에서 메시지를 저장하고 WebSocket으로 브로드캐스트하므로 onNewMessage 리스너를 통해 자동으로 수신됨
    } catch (error) {
      console.error("Failed to send message:", error);
      // 에러 처리는 필요시 추가
    }
  };

  if (!roomId) {
    return <div>채팅방을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="flex h-[calc(100vh-200px)] flex-col">
      {/* 메시지 영역 */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-400">메시지를 불러오는 중...</div>
          </div>
        ) : allMessages.length === 0 ? (
          <EmptyState message="메시지가 없습니다." />
        ) : (
          <>
            {/* 이전 메시지 로드 트리거 */}
            {hasNextPage && (
              <div
                ref={loadMoreRef}
                className="flex min-h-[100px] items-center justify-center py-4"
              >
                {isFetchingNextPage && (
                  <div className="flex flex-col items-center gap-2 text-sm text-gray-400">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span>이전 메시지를 불러오는 중...</span>
                  </div>
                )}
              </div>
            )}
            {allMessages.map((message) => {
              // 맞춤 주문 요청/견적은 카드로 렌더링
              if (message.relatedCustomOrderRequestId) {
                return (
                  <div key={message.id} className="flex justify-start">
                    <CustomOrderRequestCard requestId={message.relatedCustomOrderRequestId} />
                  </div>
                );
              }

              // 시스템 안내(연결 확인, 무응답 안내)는 가운데 정렬
              if (message.senderType === "system") {
                return (
                  <div key={message.id} className="flex justify-center">
                    <div className="max-w-[85%] rounded-lg bg-gray-50 px-[12px] py-[6px] text-center text-xs text-gray-500">
                      {message.text}
                    </div>
                  </div>
                );
              }

              const isUser = message.senderType === "consumer";
              return (
                <div
                  key={message.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex max-w-[70%] flex-col ${isUser ? "items-end" : "items-start"}`}>
                    {/* AI라는 걸 숨기지 않는다 — 손님 화면에도 표시 */}
                    {message.isAiGenerated && (
                      <span className="mb-[3px] rounded bg-primary-50 px-[7px] py-[2px] text-xs font-bold text-primary">
                        AI 자동응답
                      </span>
                    )}
                    <div
                      className={`rounded-lg px-[14px] py-[9px] ${
                        isUser ? "bg-primary text-white" : "bg-gray-50 text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className={`mt-[3px] text-xs ${isUser ? "text-white/70" : "text-gray-400"}`}>
                        {formatTime(message.createdAt)}
                      </p>
                    </div>

                    {/* AI 답변 피드백 */}
                    {message.isAiGenerated && (
                      <div className="mt-[4px] flex gap-[6px]">
                        {(["POSITIVE", "NEGATIVE"] as const).map((rating) => {
                          const isSelected = message.aiFeedback === rating;
                          return (
                            <button
                              key={rating}
                              type="button"
                              disabled={Boolean(message.aiFeedback)}
                              onClick={() =>
                                feedbackMutation.mutate({
                                  roomId,
                                  messageId: message.id,
                                  rating: rating === "POSITIVE" ? "positive" : "negative",
                                })
                              }
                              className={`rounded-md border px-[7px] py-[2px] text-xs ${
                                isSelected
                                  ? "border-primary bg-primary-50"
                                  : "border-gray-100 bg-white disabled:opacity-40"
                              }`}
                            >
                              {rating === "POSITIVE" ? "👍" : "👎"}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* AI가 모른다고 답했을 때만 연결 버튼 노출 (상시 버튼은 두지 않음) */}
                    {message.aiSuggestsHandoff && (
                      <button
                        type="button"
                        onClick={() => requestHumanMutation.mutate(roomId)}
                        disabled={requestHumanMutation.isPending}
                        className="mt-[6px] rounded-full border border-primary bg-white px-[13px] py-[7px] text-xs font-bold text-primary disabled:opacity-50"
                      >
                        네, 연결해주세요
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* 입력 영역 */}
      <div className="border-t border-gray-100 bg-white p-4">
        <div className="flex gap-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex min-h-[60px] w-full rounded-md border border-gray-100 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            maxLength={1000}
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="shrink-0 rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-400">{newMessage.length}/1000</p>
      </div>
    </div>
  );
};
