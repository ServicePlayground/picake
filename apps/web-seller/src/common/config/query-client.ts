import { QueryClient } from "@tanstack/react-query";
import { QUERY_STALE_TIME } from "@/apps/web-seller/common/constants/query-cache.constants";

// QueryClient 인스턴스 생성
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY_STALE_TIME.DEFAULT,
      // 캐시에서 데이터를 유지하는 시간 (10분)
      gcTime: 10 * 60 * 1000,
      // 자동으로 데이터를 다시 가져오는 간격 (비활성)
      refetchInterval: false,
      refetchOnMount: true,
      // 관리자 패널 탭 전환 시 불필요한 refetch 방지
      refetchOnWindowFocus: false,
      // 네트워크 재연결 시 자동 리페치
      refetchOnReconnect: true,
      // 에러 발생 시 재시도 횟수
      retry: 0,
      // 가장 가까운 상위 error boundary컴포넌트에서 캐치
      // throwOnError: true,
    },
    mutations: {
      // 뮤테이션 에러 발생 시 재시도 횟수
      retry: 0,
      // 가장 가까운 상위 error boundary컴포넌트에서 캐치
      // throwOnError: true,
    },
  },
});
