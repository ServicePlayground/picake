import { useInfiniteQuery } from "@tanstack/react-query";
import { useQueryErrorAlert } from "@/apps/web-seller/common/hooks/useQueryErrorAlert";
import { chatApi } from "@/apps/web-seller/features/chat/apis/chat.api";
import { chatQueryKeys } from "@/apps/web-seller/features/chat/constants/chatQueryKeys.constant";
import {
  MessageListResponseDto,
  GetMessagesRequestDto,
  ChatRoomListForSellerResponseDto,
  GetChatRoomsRequestDto,
} from "@/apps/web-seller/features/chat/types/chat.dto";

// 스토어의 채팅방 목록 조회 (무한 스크롤)
export function useChatRoomsByStore(storeId: string, limit: number = 20) {
  const query = useInfiniteQuery<ChatRoomListForSellerResponseDto>({
    queryKey: chatQueryKeys.list({ storeId, limit }),
    queryFn: ({ pageParam = 1 }) => {
      const params: GetChatRoomsRequestDto = {
        page: pageParam as number,
        limit,
      };
      return chatApi.getChatRoomsByStore(storeId, params);
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.hasNext) {
        return lastPage.meta.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!storeId,
  });

  useQueryErrorAlert(query);

  return query;
}

// 메시지 목록 조회 (무한스크롤)
export function useMessages(roomId: string, limit: number = 50) {
  const query = useInfiniteQuery<MessageListResponseDto>({
    queryKey: chatQueryKeys.messages(roomId, { limit }),
    queryFn: ({ pageParam = 1 }) => {
      const params: GetMessagesRequestDto = {
        page: pageParam as number,
        limit,
      };
      return chatApi.getMessages(roomId, params);
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.hasNext) {
        return lastPage.meta.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!roomId,
  });

  useQueryErrorAlert(query);

  return query;
}
