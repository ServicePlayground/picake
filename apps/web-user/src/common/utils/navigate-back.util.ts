import { PATHS } from "@/apps/web-user/common/constants/paths.constant";

type NavigateBackRouter = {
  back: () => void;
  replace: (href: string) => void;
};

/** 브라우저/WebView 히스토리에 이전 페이지가 있는지 확인합니다. */
export function canNavigateBack(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.history.length > 1;
}

/**
 * 뒤로가기를 시도하고, 히스토리가 없으면 fallback 경로로 이동합니다.
 * 앱 링크·알림톡 등으로 특정 페이지에 바로 진입한 경우를 대비합니다.
 */
export function navigateBack(
  router: NavigateBackRouter,
  options?: { fallbackPath?: string },
): void {
  const fallbackPath = options?.fallbackPath ?? PATHS.HOME;

  if (canNavigateBack()) {
    router.back();
    return;
  }

  router.replace(fallbackPath);
}
