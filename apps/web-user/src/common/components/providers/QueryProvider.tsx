"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/apps/web-user/common/config/query-client";

interface QueryProviderProps {
  children: any; // vercel 빌드 오류 방지를 위해 any 타입 사용 // Type 'bigint' is not assignable to type 'ReactNode'.
}

export function QueryProvider({ children }: QueryProviderProps) {
  const isDevelopment = process.env.NEXT_PUBLIC_NODE_ENV === "development";

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* 개발 환경에서만 DevTools 표시 */}
      {isDevelopment && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
