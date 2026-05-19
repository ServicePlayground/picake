import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  mypageApi,
  type NotificationPreferences,
} from "@/apps/web-user/features/mypage/apis/mypage.api";
import { useAlertStore } from "@/apps/web-user/common/store/alert.store";
import getApiMessage from "@/apps/web-user/common/utils/getApiMessage";

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  const { showAlert } = useAlertStore();

  return useMutation({
    mutationFn: mypageApi.updateNotificationPreferences,
    // 토글 즉시 반응을 위해 optimistic update — 실패 시 이전 값으로 롤백
    onMutate: async (body) => {
      await queryClient.cancelQueries({ queryKey: ["mypage", "notification-preferences"] });
      const previous = queryClient.getQueryData<NotificationPreferences>([
        "mypage",
        "notification-preferences",
      ]);
      if (previous) {
        queryClient.setQueryData<NotificationPreferences>(
          ["mypage", "notification-preferences"],
          { ...previous, ...body },
        );
      }
      return { previous };
    },
    onError: (error, _body, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["mypage", "notification-preferences"], context.previous);
      }
      showAlert({
        type: "error",
        title: "알림 설정 변경 실패",
        message: getApiMessage.error(error),
      });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["mypage", "notification-preferences"], data);
    },
  });
}
