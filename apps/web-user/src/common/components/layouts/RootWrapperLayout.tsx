"use client";

import { ReactNode } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import Header from "@/apps/web-user/common/components/headers/Header";
import { Alert } from "@/apps/web-user/common/components/alerts/Alert";
import { ConfirmAlert } from "@/apps/web-user/common/components/alerts/ConfirmAlert";
import BuildInfoLogger from "@/apps/web-user/common/components/debug/BuildInfoLogger";
import { AuthProvider } from "@/apps/web-user/common/components/providers/AuthProvider";
import { AlarmRealtimeListener } from "@/apps/web-user/features/alarm/components/AlarmRealtimeListener";
import { LoginBottomSheet } from "@/apps/web-user/features/auth/components/LoginBottomSheet";
import { useAuthHasHydrated, useAuthStore } from "@/apps/web-user/common/store/auth.store";
import { isWebViewEnvironment } from "@/apps/web-user/common/utils/webview.bridge";

const PaymentPendingLaunchSheet = dynamic(
  () =>
    import("@/apps/web-user/features/order/components/PaymentPendingLaunchSheet").then(
      (module) => module.PaymentPendingLaunchSheet,
    ),
  { ssr: false },
);

interface RootWrapperLayoutProps {
  children: ReactNode;
}

/** 로그인 + 웹뷰 환경에서만 결제 대기 시트(및 useMyOrders)를 로드합니다. */
function PaymentPendingLaunchSheetGate() {
  const hasHydrated = useAuthHasHydrated();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!hasHydrated || !isAuthenticated || !isWebViewEnvironment()) {
    return null;
  }

  return <PaymentPendingLaunchSheet />;
}

export default function RootWrapperLayout({ children }: RootWrapperLayoutProps) {
  const pathname = usePathname();

  // pathname에 따라 헤더 설정 결정
  const getHeaderConfig = (): {
    variant: "main" | "product" | "minimal" | "search" | "back-title";
    title?: string;
  } => {
    if (pathname === "/") return { variant: "main" };
    if (pathname === "/search") return { variant: "search" };
    if (pathname === "/map" || pathname === "/map/search") return { variant: "minimal" };
    if (pathname?.startsWith("/chat")) return { variant: "minimal" };
    if (pathname?.startsWith("/reservation")) return { variant: "minimal" };
    if (pathname === "/alarm") return { variant: "back-title", title: "알림" };
    if (pathname === "/mypage/setting") return { variant: "back-title", title: "설정" };
    if (pathname === "/mypage/setting/account")
      return { variant: "back-title", title: "내 계정 정보" };
    if (pathname === "/mypage/setting/notification")
      return { variant: "back-title", title: "알림 설정" };
    if (pathname === "/qa") return { variant: "minimal" };
    if (
      pathname === "/auth/register/google" ||
      pathname === "/auth/login/google" ||
      pathname === "/auth/register/kakao" ||
      pathname === "/auth/login/kakao"
    ) {
      return { variant: "minimal" };
    }
    if (pathname?.startsWith("/mypage/")) return { variant: "minimal" };
    if (pathname?.startsWith("/order/")) return { variant: "minimal" };
    if (pathname === "/mypage") return { variant: "minimal" };
    if (pathname === "/saved") return { variant: "minimal" };
    if (pathname?.startsWith("/product/")) return { variant: "product" };
    if (pathname?.startsWith("/store/")) return { variant: "product" };
    return { variant: "main" };
  };

  const { variant: headerVariant, title: headerTitle } = getHeaderConfig();

  return (
    <AuthProvider>
      <BuildInfoLogger />
      <AlarmRealtimeListener />
      <div
        id="root-scroll-container"
        className="w-full sm:w-[640px] h-screen mx-auto sm:border-x border-gray-200 overflow-y-auto overflow-x-hidden scrollbar-hide"
      >
        <Header variant={headerVariant} title={headerTitle} />
        <div>{children}</div>
        <Alert />
        <ConfirmAlert />
        <LoginBottomSheet />
        <PaymentPendingLaunchSheetGate />
      </div>
    </AuthProvider>
  );
}
