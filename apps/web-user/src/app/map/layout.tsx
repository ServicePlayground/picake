import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "케이크 지도",
  description:
    "지도에서 내 주변 케이크 매장을 탐색하세요. 픽업 날짜·구간 필터로 원하는 날 픽업 가능한 매장을 바로 찾을 수 있어요.",
  keywords: ["케이크 지도", "근처 케이크", "케이크 픽업", "케이크 매장 지도", "내 주변 케이크"],
  alternates: { canonical: "/map" },
  openGraph: {
    title: "케이크 지도 | Picake",
    description: "지도에서 내 주변 케이크 매장을 탐색하세요.",
    url: "https://picakes.com/map",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return children;
}
