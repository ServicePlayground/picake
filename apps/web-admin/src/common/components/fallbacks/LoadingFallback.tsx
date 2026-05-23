"use client";

import { useEffect, useState } from "react";
import { AdminAppLogo } from "@/apps/web-admin/common/components/branding/AdminAppLogo";
import { LoadingSpinner } from "@/apps/web-admin/common/components/loading/LoadingSpinner";

interface LoadingFallbackProps {
  variant?: "overlay" | "corner";
  message?: string;
  /** 점 애니메이션 (Suspense 전체 화면 등에만 사용 권장) */
  animatedEllipsis?: boolean;
}

export function LoadingFallback({
  variant = "overlay",
  message = "로딩 중…",
  animatedEllipsis = true,
}: LoadingFallbackProps) {
  const [dots, setDots] = useState("");

  const useDots = variant === "overlay" && animatedEllipsis;

  useEffect(() => {
    if (!useDots) return;
    const interval = window.setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : `${prev}.`));
    }, 500);
    return () => window.clearInterval(interval);
  }, [useDots]);

  const suffix = useDots ? dots : "";

  if (variant === "corner") {
    return (
      <div className="fixed bottom-5 right-5 z-[1000] flex items-center gap-3 rounded-lg border border-zinc-200/80 bg-white/95 p-3 pr-4 shadow-lg backdrop-blur-sm">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-zinc-50 p-0.5">
          <AdminAppLogo width={28} className="max-h-8" />
        </div>
        <LoadingSpinner size="sm" className="text-zinc-600" />
        <p className="text-sm font-medium text-zinc-800">
          {message}
          {suffix}
        </p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-b from-zinc-50 to-white">
      <div className="flex flex-col items-center gap-6">
        <div className="animate-pulse rounded-2xl border border-zinc-200/80 bg-white px-8 py-6 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)]">
          <AdminAppLogo width={88} className="opacity-95" />
        </div>
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner size="xl" className="text-zinc-600" />
          <p className="text-base font-medium text-zinc-700">
            {message}
            {suffix}
          </p>
        </div>
      </div>
    </div>
  );
}
