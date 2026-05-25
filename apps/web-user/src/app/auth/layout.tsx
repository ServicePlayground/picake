import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "로그인",
  description: "Picake에 로그인하세요.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
