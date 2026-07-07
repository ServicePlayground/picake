import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "알림",
  description: "Picake 서비스 알림을 확인하세요.",
};

export default function AlarmLayout({ children }: { children: React.ReactNode }) {
  return children;
}
