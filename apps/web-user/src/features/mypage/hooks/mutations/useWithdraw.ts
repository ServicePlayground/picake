import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { mypageApi } from "@/apps/web-user/features/mypage/apis/mypage.api";
import { useAuthStore } from "@/apps/web-user/common/store/auth.store";
import { useAlertStore } from "@/apps/web-user/common/store/alert.store";
import { PATHS } from "@/apps/web-user/common/constants/paths.constant";
import getApiMessage from "@/apps/web-user/common/utils/getApiMessage";

export function useWithdraw() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { showAlert } = useAlertStore();

  return useMutation({
    mutationFn: mypageApi.withdraw,
    onSuccess: () => {
      logout();
      router.replace(PATHS.MYPAGE);
    },
    onError: (error) => {
      showAlert({
        type: "error",
        title: "회원탈퇴 실패",
        message: getApiMessage.error(error),
      });
    },
  });
}
