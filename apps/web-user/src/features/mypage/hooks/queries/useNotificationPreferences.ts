import { useQuery } from "@tanstack/react-query";
import { useQueryErrorAlert } from "@/apps/web-user/common/hooks/useQueryErrorAlert";
import { useAuthStore } from "@/apps/web-user/common/store/auth.store";
import {
  mypageApi,
  type NotificationPreferences,
} from "@/apps/web-user/features/mypage/apis/mypage.api";

export function useNotificationPreferences() {
  const { isAuthenticated } = useAuthStore();

  const query = useQuery<NotificationPreferences>({
    queryKey: ["mypage", "notification-preferences"],
    queryFn: mypageApi.getNotificationPreferences,
    enabled: isAuthenticated,
  });

  useQueryErrorAlert(query);

  return query;
}
