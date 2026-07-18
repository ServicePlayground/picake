import { LoadingFallback } from "@/apps/web-user/common/components/fallbacks/LoadingFallback";

/**
 * 라우트 전환 공통 로딩 UI.
 * 페이지 이동 시 새 페이지 청크 로드가 끝나기 전에도 즉시 피드백을 보여줘
 * 웹뷰에서 "눌렀는데 반응이 없다"는 체감 지연을 줄입니다. (루트 Suspense와 동일한 LoadingFallback 사용)
 */
export default function Loading() {
  return <LoadingFallback variant="overlay" message="페이지를 불러오는 중" />;
}
