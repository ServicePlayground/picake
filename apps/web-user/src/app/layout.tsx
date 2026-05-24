import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import localFont from "next/font/local";
import "@/apps/web-user/common/styles/globals.css";
import { QueryProvider } from "@/apps/web-user/common/components/providers/QueryProvider";
import { ErrorBoundaryProvider } from "@/apps/web-user/common/components/providers/ErrorBoundaryProvider";
import { LoadingFallback } from "@/apps/web-user/common/components/fallbacks/LoadingFallback";
import RootWrapperLayout from "@/apps/web-user/common/components/layouts/RootWrapperLayout";

const pretendard = localFont({
  src: "../../public/fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  display: "swap",
  weight: "45 920",
});

// SEO 최적화를 위해 검색 엔진이 페이지 정보를 수집할 때 사용됨
// 소셜 미디어 공유 시, 페이지 제목, 설명, 이미지 등을 제공할 수 있음
// 기본 메타데이터 (TODO: 추후 수정필요)
export const metadata: Metadata = {
  title: {
    default: "Picake - 달콤한 디저트 주문 플랫폼",
    template: "%s | Picake", // 하위 페이지에서 %s 부분이 교체됨
  },
  description:
    "달콤한 디저트를 온라인으로 주문하는 최고의 플랫폼. 신선한 케이크, 쿠키, 마카롱 등 다양한 디저트를 집에서 편리하게 주문하세요.",
  keywords: [
    "디저트 주문",
    "케이크 주문",
    "온라인 디저트",
    "디저트 배달",
    "Picake",
    "달콤한 디저트",
    "디저트 플랫폼",
  ],
  authors: [{ name: "Picake Team" }],
  creator: "Picake",
  publisher: "Picake",

  // Open Graph (페이스북, 카카오톡 등 소셜 미디어 공유용)
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://picakes.com",
    siteName: "Picake",
    title: "Picake - 달콤한 디저트 주문 플랫폼",
    description:
      "달콤한 디저트를 온라인으로 주문하는 최고의 플랫폼. 신선한 케이크, 쿠키, 마카롱 등 다양한 디저트를 집에서 편리하게 주문하세요.",
    images: [
      {
        url: "/og-image.jpg", // 1200x630px 권장
        width: 1200,
        height: 630,
        alt: "Picake - 달콤한 디저트 주문 플랫폼",
      },
    ],
  },

  // 추가 SEO 최적화
  robots: {
    index: true, // 검색엔진 인덱싱 허용
    follow: true, // 링크 따라가기 허용
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // 앱 관련 메타데이터
  applicationName: "Picake",
  category: "Food & Dining",

  // 추가 메타데이터
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Picake",
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#ff6b6b",
    "theme-color": "#ff6b6b",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={pretendard.className}>
        <ErrorBoundaryProvider>
          <QueryProvider>
            <Suspense
              fallback={<LoadingFallback variant="overlay" message="페이지를 불러오는 중" />}
            >
              <RootWrapperLayout>{children}</RootWrapperLayout>
            </Suspense>
          </QueryProvider>
        </ErrorBoundaryProvider>
      </body>
    </html>
  );
}
