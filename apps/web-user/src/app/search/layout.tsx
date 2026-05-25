import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "케이크 검색",
  description:
    "원하는 케이크와 매장을 검색해보세요. 생일케이크, 레터링케이크, 커스텀케이크 등 다양한 케이크를 Picake에서 찾을 수 있어요.",
  keywords: ["케이크 검색", "케이크 찾기", "케이크 맛집 검색", "Picake 검색"],
  alternates: { canonical: "/search" },
  openGraph: {
    title: "케이크 검색 | Picake",
    description: "원하는 케이크와 매장을 검색해보세요.",
    url: "https://picakes.com/search",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
