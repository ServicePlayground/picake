import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "로그인",
  description: "Picake에 로그인하세요.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
