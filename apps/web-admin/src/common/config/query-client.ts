import { QueryClient } from "@tanstack/react-query";

// QueryClient 인스턴스 생성
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 데이터가 stale로 간주되는 시간 (0으로 설정하여 항상 최신 데이터로 간주)
      staleTime: 0,
      // 캐시에서 데이터를 유지하는 시간 (10분)
      gcTime: 10 * 60 * 1000,
      // 자동으로 데이터를 다시 가져오는 간격 (비활성)
      refetchInterval: false,
      // 컴포넌트가 마운트될 때마다 refetch (항상 최신 데이터 조회)
      refetchOnMount: true,
      // 윈도우 포커스 시 자동 리페치 (탭 전환 후 돌아왔을 때 최신 데이터 조회)
      refetchOnWindowFocus: true,
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
