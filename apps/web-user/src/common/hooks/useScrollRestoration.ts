import { useEffect, useLayoutEffect } from "react";

/** RootWrapperLayout의 실제 스크롤 영역 id (window가 아닌 내부 컨테이너가 스크롤됨) */
const SCROLL_CONTAINER_ID = "root-scroll-container";

/** SSR 환경에서 useLayoutEffect 경고를 피하기 위한 분기 */
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * 스크롤 위치를 sessionStorage에 저장하고 복원하는 훅.
 *
 * 이 앱은 window가 아니라 RootWrapperLayout의 overflow-y-auto 컨테이너가 스크롤되기 때문에
 * 브라우저/Next.js 기본 스크롤 복원이 동작하지 않는다. 그래서 직접 컨테이너의 scrollTop을 관리한다.
 *
 * @param key 페이지를 구분하는 저장 키 (보통 pathname)
 * @param enabled 데이터 로딩 등으로 복원 시점을 늦추고 싶을 때 사용. false면 복원/저장하지 않음.
 */
export function useScrollRestoration(key: string, enabled = true) {
  useIsomorphicLayoutEffect(() => {
    if (!enabled) return;

    const container = document.getElementById(SCROLL_CONTAINER_ID);
    if (!container) return;

    const storageKey = `scroll-position:${key}`;
    const saved = Number(sessionStorage.getItem(storageKey));

    // 복원: 데이터가 늦게 들어와 높이가 늘어날 수 있으므로 몇 프레임에 걸쳐 목표 위치를 맞춘다.
    let rafId = 0;
    if (saved > 0) {
      let attempts = 0;
      const restore = () => {
        container.scrollTop = saved;
        // 아직 콘텐츠 높이가 부족해 목표에 못 미치면 다음 프레임에 재시도 (최대 ~10프레임)
        if (container.scrollTop < saved && attempts < 10) {
          attempts += 1;
          rafId = requestAnimationFrame(restore);
        }
      };
      rafId = requestAnimationFrame(restore);
    }

    // 저장: 스크롤할 때마다 최신 위치를 기록
    const handleScroll = () => {
      sessionStorage.setItem(storageKey, String(container.scrollTop));
    };
    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      container.removeEventListener("scroll", handleScroll);
    };
  }, [key, enabled]);
}
