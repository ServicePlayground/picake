import { useEffect } from "react";
import { useAlertStore } from "@/apps/web-admin/common/store/alert.store";
import getApiMessage from "@/apps/web-admin/common/utils/getApiMessage";

/** React Query 조회 실패 시 공통 에러 알림 */
export function useQueryErrorAlert(query: { isError: boolean; error: unknown }) {
  const { addAlert } = useAlertStore();

  useEffect(() => {
    if (query.isError) {
      addAlert({
        severity: "error",
        message: getApiMessage.error(query.error),
      });
    }
  }, [query.isError, query.error, addAlert]);
}
