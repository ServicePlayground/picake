import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PATHS } from "@/apps/web-user/common/constants/paths.constant";
import { setPostLoginRedirect } from "@/apps/web-user/features/auth/utils/post-login-redirect.util";

/**
 * 로그인이 필요한 화면에서 비로그인 사용자를 로그인 화면으로 보낸다.
 * persist 복원 전 오판을 막기 위해 호출부에서 hydration 완료 여부를 함께 넘긴다.
 */
export function useRequireLogin(isLoginRequired: boolean) {
  const router = useRouter();

  useEffect(() => {
    if (isLoginRequired) {
      // 로그인 완료 후 돌아올 수 있도록 현재 경로를 저장
      setPostLoginRedirect();
      // 뒤로가기로 되돌아오면 다시 튕기므로 히스토리를 대체
      router.replace(PATHS.AUTH.LOGIN);
    }
  }, [isLoginRequired, router]);
}
