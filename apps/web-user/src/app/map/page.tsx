"use client";

import dynamic from "next/dynamic";
import { LoadingFallback } from "@/apps/web-user/common/components/fallbacks/LoadingFallback";

const MapPageClient = dynamic(() => import("./MapPageClient"), {
  ssr: false,
  loading: () => <LoadingFallback variant="overlay" message="지도를 불러오는 중" />,
});

export default function MapPage() {
  return <MapPageClient />;
}
