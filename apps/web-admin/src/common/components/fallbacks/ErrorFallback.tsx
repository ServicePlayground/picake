"use client";

import { FallbackProps } from "react-error-boundary";
import { BaseButton as Button } from "@/apps/web-admin/common/components/buttons/BaseButton";
import { Card, CardContent } from "@/apps/web-admin/common/components/cards/Card";
import {
  BaseAlert as Alert,
  AlertTitle,
  AlertDescription,
} from "@/apps/web-admin/common/components/alerts/BaseAlert";
import { AlertCircle, RotateCcw, RotateCw } from "lucide-react";

interface ErrorFallbackProps extends FallbackProps {
  error: unknown;
  resetErrorBoundary: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const handleRetry = () => {
    resetErrorBoundary();
  };

  const handleReload = () => {
    window.location.reload();
  };

  // error를 Error 타입으로 안전하게 변환
  const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <Card className="max-w-md w-full text-center">
        <CardContent className="p-8">
          <div className="flex flex-col items-center gap-6">
            <AlertCircle className="h-12 w-12 text-destructive" />

            <h2 className="text-2xl font-semibold text-destructive">
              예상치 못한 오류가 발생했습니다
            </h2>

            <Alert variant="destructive" className="w-full">
              <AlertTitle>오류 상세</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>

            <div className="flex gap-2 w-full">
              <Button onClick={handleRetry} className="flex-1 gap-2">
                <RotateCcw className="h-4 w-4" />
                다시 시도
              </Button>
              <Button variant="outline" onClick={handleReload} className="flex-1 gap-2">
                <RotateCw className="h-4 w-4" />
                페이지 새로고침
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
