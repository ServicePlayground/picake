import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "채팅",
  description: "매장과 채팅으로 문의하세요.",
};

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return children;
}
