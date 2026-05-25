import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/apps/web-user/common/store/alert.store";
import getApiMessage from "@/apps/web-user/common/utils/getApiMessage";
import { alarmApi } from "@/apps/web-user/features/alarm/apis/alarm.api";
import { alarmQueryKeys } from "@/apps/web-user/features/alarm/constants/alarmQueryKeys.constant";

export function useMarkAlarmRead() {
  const queryClient = useQueryClient();
  const { showAlert } = useAlertStore();

  return useMutation({
    mutationFn: (notificationId: string) => alarmApi.markRead(notificationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: alarmQueryKeys.list() });
      void queryClient.invalidateQueries({ queryKey: alarmQueryKeys.unread() });
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
