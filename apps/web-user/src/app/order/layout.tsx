import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "주문",
  description: "Picake 주문 정보를 확인하세요.",
};

export default function OrderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
