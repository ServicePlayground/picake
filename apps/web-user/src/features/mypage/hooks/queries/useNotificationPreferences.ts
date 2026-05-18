import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/apps/web-user/common/store/auth.store";
import {
  mypageApi,
  type NotificationPreferences,
} from "@/apps/web-user/features/mypage/apis/mypage.api";

export function useNotificationPreferences() {
  const { isAuthenticated } = useAuthStore();

  return useQuery<NotificationPreferences>({
    queryKey: ["mypage", "notification-preferences"],
    queryFn: mypageApi.getNotificationPreferences,
    enabled: isAuthenticated,
  });
}
