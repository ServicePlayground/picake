import { useMutation, useQueryClient } from "@tanstack/react-query";
import { storeApi } from "@/apps/web-user/features/store/apis/store.api";
import { storeQueryKeys } from "@/apps/web-user/features/store/constants/storeQueryKeys.constant";
import { useAlertStore } from "@/apps/web-user/common/store/alert.store";
import getApiMessage from "@/apps/web-user/common/utils/getApiMessage";
import type { CreateStoreEntryRequest } from "@/apps/web-user/features/store/types/store-entry-request.type";

/** 미입점 스토어 입점 요청 */
export function useRequestStoreEntry() {
  const queryClient = useQueryClient();
  const { showAlert } = useAlertStore();

  return useMutation({
    mutationFn: (data: CreateStoreEntryRequest) => storeApi.createEntryRequest(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: storeQueryKeys.entryRequestExists(variables.kakaoPlaceId),
      });
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
