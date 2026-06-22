"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Header from "@/apps/web-user/common/components/headers/Header";
import { Alert } from "@/apps/web-user/common/components/alerts/Alert";
import { ConfirmAlert } from "@/apps/web-user/common/components/alerts/ConfirmAlert";
import BuildInfoLogger from "@/apps/web-user/common/components/debug/BuildInfoLogger";
import { AuthProvider } from "@/apps/web-user/common/components/providers/AuthProvider";
import { AlarmRealtimeListener } from "@/apps/web-user/features/alarm/components/AlarmRealtimeListener";
import { LoginBottomSheet } from "@/apps/web-user/features/auth/components/LoginBottomSheet";
import { PaymentPendingLaunchSheet } from "@/apps/web-user/features/order/components/PaymentPendingLaunchSheet";

interface RootWrapperLayoutProps {
  children: ReactNode;
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
        <PaymentPendingLaunchSheet />
      </div>
    </AuthProvider>
  );
}
