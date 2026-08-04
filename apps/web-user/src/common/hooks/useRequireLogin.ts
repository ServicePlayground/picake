import { useEffect } from "react";
import { useLoginSheetStore } from "@/apps/web-user/common/store/login-sheet.store";

/**
 * 로그인이 필요한 화면에서 비로그인 사용자에게 로그인 바텀시트를 띄운다.
 * persist 복원 전 오판을 막기 위해 호출부에서 hydration 완료 여부를 함께 넘긴다.
 */
export function useRequireLogin(isLoginRequired: boolean) {
  const openLoginSheet = useLoginSheetStore((s) => s.openLoginSheet);

  useEffect(() => {
    if (isLoginRequired) {
      openLoginSheet("session_expired");
    }
  }, [isLoginRequired, openLoginSheet]);
}
