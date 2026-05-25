import { useQuery } from "@tanstack/react-query";
import { useQueryErrorAlert } from "@/apps/web-user/common/hooks/useQueryErrorAlert";
import { useAuthStore } from "@/apps/web-user/common/store/auth.store";
import { mypageApi } from "@/apps/web-user/features/mypage/apis/mypage.api";
import type { MypageProfile } from "@/apps/web-user/features/mypage/types/profile.type";

export function useMypageProfile() {
  const { isAuthenticated } = useAuthStore();

  const query = useQuery<MypageProfile>({
    queryKey: ["mypage", "profile"],
    queryFn: mypageApi.getProfile,
    enabled: isAuthenticated,
  });

  useQueryErrorAlert(query);

  return query;
}
