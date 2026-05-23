import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuthStore } from "@/apps/web-admin/features/auth/store/auth.store";
import { authApi } from "@/apps/web-admin/features/auth/apis/auth.api";
import { authQueryKeys } from "@/apps/web-admin/features/auth/constants/authQueryKeys.constant";

// 현재 사용자 정보 조회 (새로고침 시 자동 실행)
export function useMe() {
  const { setInitialized, login } = useAuthStore();

  const query = useQuery({
    queryKey: authQueryKeys.me,
    queryFn: authApi.me,
    throwOnError: false,
    refetchOnWindowFocus: true,
  });

  // 쿼리 결과 처리
  useEffect(() => {
    if (query.isSuccess && query.data) {
      login({});
    }
    setInitialized(true);
  }, [query.isSuccess, query.isError, query.data, setInitialized, login]);

  return query;
}
