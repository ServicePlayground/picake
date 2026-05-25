import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "예약",
  description: "케이크 예약을 완료하세요.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ReservationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
