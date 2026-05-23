import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mypageApi } from "@/apps/web-user/features/mypage/apis/mypage.api";
import { useAlertStore } from "@/apps/web-user/common/store/alert.store";
import getApiMessage from "@/apps/web-user/common/utils/getApiMessage";

export function useUpdateMypageProfile() {
  const queryClient = useQueryClient();
  const { showAlert } = useAlertStore();

  return useMutation({
    mutationFn: mypageApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mypage", "profile"] });
    },
    onError: (error) => {
      showAlert({
        type: "error",
        title: "프로필 수정 실패",
        message: getApiMessage.error(error),
      });
    },
  });
}
