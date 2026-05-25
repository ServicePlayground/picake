import { useEffect } from "react";
import { useAlertStore } from "@/apps/web-user/common/store/alert.store";
import getApiMessage from "@/apps/web-user/common/utils/getApiMessage";

/** React Query 조회 실패 시 공통 에러 알림 (useStoreFeeds 패턴) */
export function useQueryErrorAlert(query: { isError: boolean; error: unknown }) {
  const { showAlert } = useAlertStore();

  useEffect(() => {
    if (query.isError) {
      showAlert({
        type: "error",
        title: "오류",
        message: getApiMessage.error(query.error),
      });
    }
  }, [query.isError, query.error, showAlert]);
}
