"use client";

import { LocationPermissionModal } from "@/apps/web-user/common/components/modals/LocationPermissionModal";
import { useWebViewBridge } from "@/apps/web-user/common/utils/webview.bridge";

/**
 * 인증 상태를 관리하는 Provider 컴포넌트
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  useWebViewBridge(); // 웹뷰 브릿지 초기화 훅

  return (
    <>
      {children}
      <LocationPermissionModal />
    </>
  );
}
