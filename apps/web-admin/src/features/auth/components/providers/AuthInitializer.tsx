import { useMe } from "@/apps/web-admin/features/auth/hooks/queries/useAuthQuery";
import { useAuthStore } from "../../store/auth.store";
import { LoadingFallback } from "@/apps/web-admin/common/components/fallbacks/LoadingFallback";

interface AuthInitializerProviderProps {
  children: React.ReactNode;
}

export function AuthInitializerProvider({ children }: AuthInitializerProviderProps) {
  useMe(); // 사용자 정보 조회 (새로고침 시 자동 실행)
  const { isInitialized } = useAuthStore();

  // 초기화가 완료되지 않았으면 로딩 표시
  if (!isInitialized) {
    return <LoadingFallback message="인증 확인 중..." />;
  }

  // 초기화가 완료되었으면 children 렌더링 (인증 여부와 관계없이)
  return <>{children}</>;
}
