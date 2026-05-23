"use client";

import { ErrorBoundary } from "react-error-boundary";
import { ErrorInfo } from "react";
import { ErrorFallback } from "@/apps/web-admin/common/components/fallbacks/ErrorFallback";

interface ErrorBoundaryProviderProps {
  children: React.ReactNode;
}

export function ErrorBoundaryProvider({ children }: ErrorBoundaryProviderProps) {
  const handleError = (error: unknown, errorInfo: ErrorInfo) => {
    // 에러 로깅 (추후 에러 모니터링 서비스 연동 가능)
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  };

  return (
    <ErrorBoundary
      onError={handleError}
      fallbackRender={({ error, resetErrorBoundary }) => (
        <ErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
