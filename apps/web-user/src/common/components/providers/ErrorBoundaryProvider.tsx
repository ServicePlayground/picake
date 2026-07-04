"use client";

import { ErrorBoundary } from "react-error-boundary";
import { ErrorInfo } from "react";
import { ErrorFallback } from "@/apps/web-user/common/components/fallbacks/ErrorFallback";
import { captureSentryException } from "@/apps/web-user/common/utils/sentry.util";

interface ErrorBoundaryProviderProps {
  children: React.ReactNode;
}

export function ErrorBoundaryProvider({ children }: ErrorBoundaryProviderProps) {
  const handleError = (error: unknown, errorInfo: ErrorInfo) => {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    captureSentryException(error, {
      contexts: { react: { componentStack: errorInfo.componentStack } },
    });
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
