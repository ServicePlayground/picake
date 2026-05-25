import { useQuery } from "@tanstack/react-query";
import { useQueryErrorAlert } from "@/apps/web-user/common/hooks/useQueryErrorAlert";
import { useAuthStore, useAuthHasHydrated } from "@/apps/web-user/common/store/auth.store";
import { alarmApi } from "@/apps/web-user/features/alarm/apis/alarm.api";
import { alarmQueryKeys } from "@/apps/web-user/features/alarm/constants/alarmQueryKeys.constant";

export function useAlarmUnreadCount() {
  const hasHydrated = useAuthHasHydrated();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const accessToken = useAuthStore((s) => s.accessToken);

  const query = useQuery({
    queryKey: [...alarmQueryKeys.all, "unread"] as const,
    queryFn: () => alarmApi.getUnreadCount(),
    enabled: hasHydrated && isAuthenticated && Boolean(accessToken),
  });

  useQueryErrorAlert(query);

  return query;
}
