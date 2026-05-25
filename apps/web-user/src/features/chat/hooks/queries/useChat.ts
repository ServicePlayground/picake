import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { chatApi } from "@/apps/web-user/features/chat/apis/chat.api";
import { useAuthStore } from "@/apps/web-user/common/store/auth.store";
import { chatQueryKeys } from "@/apps/web-user/features/chat/constants/chatQueryKeys.constant";
import {
  CreateChatRoomRequest,
  MessageListResponse,
  GetMessagesRequest,
  ChatRoomListResponse,
  GetChatRoomsRequest,
} from "@/apps/web-user/features/chat/types/chat.type";
import { useRouter } from "next/navigation";
import { useQueryErrorAlert } from "@/apps/web-user/common/hooks/useQueryErrorAlert";
import { useAlertStore } from "@/apps/web-user/common/store/alert.store";
import getApiMessage from "@/apps/web-user/common/utils/getApiMessage";

// 채팅방 목록 조회 (무한 스크롤)
export function useChatRooms(limit: number = 20) {
  const accessToken = useAuthStore((state) => state.accessToken);

  const query = useInfiniteQuery<ChatRoomListResponse>({
    queryKey: chatQueryKeys.list({ limit }),
    queryFn: ({ pageParam = 1 }) => {
      const params: GetChatRoomsRequest = {
        page: pageParam as number,
        limit,
      };
      return chatApi.getChatRooms(params);
    },
    // 반환된 값은 다음 API 요청의 queryFn의 pageParam으로 전달됩니다.
    // 이 값은 hasNextPage에도 영향을 줍니다.
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.hasNext) {
        return lastPage.meta.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!accessToken,
  });

  useQueryErrorAlert(query);

  return query;
}

// 채팅방 생성 또는 조회
export function useCreateOrGetChatRoom() {
  const router = useRouter();
  const { showAlert } = useAlertStore();

  return useMutation({
    mutationFn: (request: CreateChatRoomRequest) => chatApi.createOrGetChatRoom(request),
    onSuccess: (data) => {
      router.push(`/chat/${data.id}`);
    },
    onError: (error) => {
      showAlert({
        type: "error",
        title: "오류",
        message: getApiMessage.error(error),
      });
    },
  });
}

// 메시지 목록 조회 (무한스크롤)
export function useMessages(roomId: string, limit: number = 50) {
  const accessToken = useAuthStore((state) => state.accessToken);

  const query = useInfiniteQuery<MessageListResponse>({
    queryKey: chatQueryKeys.messages(roomId, { limit }),
    queryFn: ({ pageParam = 1 }) => {
      const params: GetMessagesRequest = {
        page: pageParam as number,
        limit,
      };
      return chatApi.getMessages(roomId, params);
    },
    // 반환된 값은 다음 API 요청의 queryFn의 pageParam으로 전달됩니다.
    // 이 값은 hasNextPage에도 영향을 줍니다.
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.hasNext) {
        return lastPage.meta.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!roomId && !!accessToken,
  });

  useQueryErrorAlert(query);

  return query;
}

// 채팅방 읽음 처리
export function useMarkChatRoomAsRead() {
  const { showAlert } = useAlertStore();

  return useMutation({
    mutationFn: (roomId: string) => chatApi.markChatRoomAsRead(roomId),
    onError: (error) => {
      showAlert({
        type: "error",
        title: "오류",
        message: getApiMessage.error(error),
      });
    },
  });
}
