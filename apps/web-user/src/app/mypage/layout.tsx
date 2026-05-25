import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "마이페이지",
  description: "주문 내역, 찜 목록, 리뷰 관리 등 나의 Picake 활동을 확인하세요.",
  alternates: { canonical: "/mypage" },
  openGraph: {
    title: "마이페이지 | Picake",
    description: "주문 내역, 찜 목록, 리뷰 관리 등 나의 Picake 활동을 확인하세요.",
    url: "https://picakes.com/mypage",
  },
  // 마이페이지는 개인 영역 - 검색엔진 색인 제외
  robots: {
    index: false,
    follow: false,
  },
};

export default function MypageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
