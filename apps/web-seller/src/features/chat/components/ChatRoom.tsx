import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useMessages } from "@/apps/web-seller/features/chat/hooks/queries/useChatQuery";
import { useMarkChatRoomAsRead } from "@/apps/web-seller/features/chat/hooks/mutations/useChatMutation";
import { chatSocketService } from "@/apps/web-seller/features/chat/services/chat-socket.service";
import type { ChatMessageResponseDto } from "@/apps/web-seller/features/chat/types/chat.dto";
import { Send, AlertTriangle } from "lucide-react";
import { BaseButton as Button } from "@/apps/web-seller/common/components/buttons/BaseButton";
import { Textarea } from "@/apps/web-seller/common/components/textareas/Textarea";
import { useToggleRoomAi } from "@/apps/web-seller/features/ai-assistant/hooks/mutations/useAiAssistantMutation";
import { CustomOrderRequestCard } from "@/apps/web-seller/features/custom-order/components/CustomOrderRequestCard";
import { cn } from "@/apps/web-seller/common/utils/classname.util";
import { formatTime } from "@/apps/web-seller/common/utils/date.util";
import { useInfiniteScroll } from "@/apps/web-seller/common/hooks/useInfiniteScroll";
import { flattenAndDeduplicateInfiniteData } from "@/apps/web-seller/common/utils/pagination.util";
import { ContentLoading } from "@/apps/web-seller/common/components/loading/ContentLoading";
import { InfiniteScrollLoading } from "@/apps/web-seller/common/components/loading/InfiniteScrollLoading";

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
  const [initialAllChatMessageResponseDtos, setInitialAllChatMessageResponseDtos] = useState<
    ChatMessageResponseDto[]
  >([]); // API를 통해 조회된 메시지 목록
  const [newAllChatMessageResponseDtos, setNewAllChatMessageResponseDtos] = useState<
    ChatMessageResponseDto[]
  >([]); // websocket을 통해 수신된 새로운 메시지 목록
  const allChatMessageResponseDtos = useMemo(
    () => [...initialAllChatMessageResponseDtos, ...newAllChatMessageResponseDtos],
    [initialAllChatMessageResponseDtos, newAllChatMessageResponseDtos],
  );
  const [newChatMessageResponseDto, setNewChatMessageResponseDto] = useState(""); // 새로운 메시지 입력
  const markAsReadMutation = useMarkChatRoomAsRead();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 응대중 토글 — 켜면 이 방만 AI를 끄고 직접 응대
  const [isDirectResponse, setIsDirectResponse] = useState(false);
  const toggleAiMutation = useToggleRoomAi();
  // AI 오답 정정 안내
  const [isCorrectionOpen, setIsCorrectionOpen] = useState(false);
  const [correctionText, setCorrectionText] = useState("");

  const hasAiMessage = allChatMessageResponseDtos.some((message) => message.isAiGenerated);

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

    const allChatMessageResponseDtos =
      flattenAndDeduplicateInfiniteData<ChatMessageResponseDto>(messagesData);

    // REST API로 받은 메시지도 필수 필드 검증 및 정규화
    const validatedChatMessageResponseDtos = allChatMessageResponseDtos.map((msg) => ({
      ...msg,
      createdAt: msg.createdAt instanceof Date ? msg.createdAt : new Date(msg.createdAt),
    }));

    setInitialAllChatMessageResponseDtos(validatedChatMessageResponseDtos);
    setNewAllChatMessageResponseDtos([]);

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
        unsubscribe = await chatSocketService.onNewMessage((message: ChatMessageResponseDto) => {
          // createdAt이 문자열인 경우 Date 객체로 변환
          const normalizedChatMessageResponseDto: ChatMessageResponseDto = {
            ...message,
            createdAt:
              message.createdAt instanceof Date ? message.createdAt : new Date(message.createdAt),
          };

          // 중복 메시지 제거: 같은 id를 가진 메시지가 이미 있으면 추가하지 않음
          setNewAllChatMessageResponseDtos((prev) => {
            const isDuplicate = prev.some((msg) => msg.id === normalizedChatMessageResponseDto.id);
            if (isDuplicate) {
              return prev;
            }
            return [...prev, normalizedChatMessageResponseDto];
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

  const handleSendChatMessageResponseDto = async () => {
    if (!newChatMessageResponseDto.trim() || !roomId) return;

    try {
      // WebSocket으로 메시지 전송
      await chatSocketService.sendMessage(roomId, newChatMessageResponseDto);
      setNewChatMessageResponseDto("");
      // 서버에서 메시지를 저장하고 WebSocket으로 브로드캐스트하므로 onNewMessage 리스너를 통해 자동으로 수신됨
    } catch (error) {
      console.error("Failed to send message:", error);
      // 에러 처리는 필요시 추가
    }
  };

  if (!roomId) {
    return <div>채팅방을 찾을 수 없습니다.</div>;
  }

  const handleToggleDirectResponse = () => {
    const nextDirectResponse = !isDirectResponse;
    setIsDirectResponse(nextDirectResponse);
    // 직접 응대 중 = AI 끔
    toggleAiMutation.mutate({ roomId, enabled: !nextDirectResponse });
  };

  const handleSendCorrection = async () => {
    if (!correctionText.trim()) return;
    await chatSocketService.sendMessage(roomId, correctionText);
    setCorrectionText("");
    setIsCorrectionOpen(false);
  };

  return (
    <div className="flex h-[calc(100vh-200px)] flex-col">
      {/* 응대중 토글 */}
      <div className="flex items-center justify-between border-b bg-card px-4 py-2">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-input"
            checked={isDirectResponse}
            onChange={handleToggleDirectResponse}
          />
          <span className="font-medium">직접 응대 중</span>
        </label>
        <span className="text-xs text-muted-foreground">
          {isDirectResponse ? "이 대화방의 AI 자동응답이 멈춰 있어요." : "AI가 1차로 답하고 있어요."}
        </span>
      </div>
      {isDirectResponse && (
        <div className="border-b bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-900">
          직접 응대 중 — AI 자동응답이 일시 중지되었습니다.
        </div>
      )}

      {/* 메시지 영역 */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {isLoading ? (
          <ContentLoading variant="section" message="메시지를 불러오는 중…" className="py-12" />
        ) : allChatMessageResponseDtos.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">메시지가 없습니다.</div>
          </div>
        ) : (
          <>
            {/* 이전 메시지 로드 트리거 */}
            {hasNextPage && (
              <div
                ref={loadMoreRef}
                className="flex min-h-[100px] items-center justify-center py-4"
              >
                {isFetchingNextPage ? (
                  <InfiniteScrollLoading
                    message="이전 메시지를 불러오는 중…"
                    className="gap-2 py-4"
                  />
                ) : null}
              </div>
            )}
            {allChatMessageResponseDtos.map((message) => {
              // 맞춤 주문 요청/견적은 카드로 렌더링
              if (message.relatedCustomOrderRequestId) {
                return (
                  <div key={message.id} className="flex justify-start">
                    <CustomOrderRequestCard requestId={message.relatedCustomOrderRequestId} />
                  </div>
                );
              }

              // 시스템 안내(무응답 안내, 이관 확인 등)는 가운데 정렬로 구분
              if (message.senderType === "system") {
                return (
                  <div key={message.id} className="flex justify-center">
                    <div className="max-w-[85%] rounded-lg bg-muted px-3 py-1.5 text-center text-xs text-muted-foreground">
                      {message.text}
                    </div>
                  </div>
                );
              }

              const isStore = message.senderType === "store";
              return (
                <div
                  key={message.id}
                  className={`flex ${isStore ? "justify-end" : "justify-start"}`}
                >
                  <div className="flex max-w-[70%] flex-col items-end">
                    {message.isAiGenerated && (
                      <span className="mb-1 rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                        AI 자동응답
                      </span>
                    )}
                    <div
                      className={cn(
                        "rounded-lg px-4 py-2",
                        isStore ? "bg-primary text-primary-foreground" : "bg-muted",
                      )}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p
                        className={`mt-1 text-xs ${
                          isStore ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}
                      >
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* AI 오답 정정 안내 (AI 답변이 있는 대화방에만) */}
      {hasAiMessage && (
        <div className="border-t bg-amber-50/70 px-4 py-2">
          {isCorrectionOpen ? (
            <div className="space-y-2">
              <Textarea
                value={correctionText}
                onChange={(e) => setCorrectionText(e.target.value)}
                placeholder="손님에게 보낼 정정 내용을 적어주세요. 예: 앞선 안내에 착오가 있었어요. 정확한 내용은…"
                className="min-h-[60px] resize-none bg-white"
                maxLength={1000}
              />
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsCorrectionOpen(false);
                    setCorrectionText("");
                  }}
                >
                  취소
                </Button>
                <Button size="sm" onClick={handleSendCorrection} disabled={!correctionText.trim()}>
                  전송
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs text-amber-900">
                <AlertTriangle className="h-3.5 w-3.5" />
                AI 답변이 잘못됐나요?
              </span>
              <Button size="sm" variant="outline" onClick={() => setIsCorrectionOpen(true)}>
                수정 안내 보내기
              </Button>
            </div>
          )}
        </div>
      )}

      {/* 입력 영역 */}
      <div className="border-t bg-card p-4">
        <div className="flex gap-2">
          <Textarea
            value={newChatMessageResponseDto}
            onChange={(e) => setNewChatMessageResponseDto(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="min-h-[60px] resize-none"
            maxLength={1000}
          />
          <Button
            onClick={handleSendChatMessageResponseDto}
            disabled={!newChatMessageResponseDto.trim()}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {newChatMessageResponseDto.length}/1000
        </p>
      </div>
    </div>
  );
};
