import type { Metadata } from "next";
import { SITE_BASE_URL } from "@/apps/web-user/common/constants/site.constants";

export const metadata: Metadata = {
  title: "마이페이지",
  description: "주문 내역, 찜 목록, 리뷰 관리 등 나의 Picake 활동을 확인하세요.",
  alternates: { canonical: "/mypage" },
  openGraph: {
    title: "마이페이지 | Picake",
    description: "주문 내역, 찜 목록, 리뷰 관리 등 나의 Picake 활동을 확인하세요.",
    url: `${SITE_BASE_URL}/mypage`,
  },
};

export default function MypageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
