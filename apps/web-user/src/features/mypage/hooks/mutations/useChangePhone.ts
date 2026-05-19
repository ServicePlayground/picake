import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mypageApi } from "@/apps/web-user/features/mypage/apis/mypage.api";
import { useAlertStore } from "@/apps/web-user/common/store/alert.store";
import getApiMessage from "@/apps/web-user/common/utils/getApiMessage";

export function useChangePhone() {
  const queryClient = useQueryClient();
  const { showAlert } = useAlertStore();

  return useMutation({
    mutationFn: mypageApi.changePhone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mypage", "profile"] });
    },
    onError: (error) => {
      showAlert({
        type: "error",
        title: "휴대폰 번호 변경 실패",
        message: getApiMessage.error(error),
      });
    },
  });
}
