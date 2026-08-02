"use client";

import { Suspense } from "react";
import { AppleRegisterVerificationScreen } from "@/apps/web-user/features/auth/components/AppleRegisterVerificationScreen";

export default function AppleRegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center bg-white">
          <p className="text-sm text-gray-600">불러오는 중...</p>
        </div>
      }
    >
      <AppleRegisterVerificationScreen />
    </Suspense>
  );
}
