import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "지도 검색",
  description: "지도에서 케이크 매장을 검색하세요.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function MapSearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
