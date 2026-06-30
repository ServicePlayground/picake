import { useEffect, useState } from "react";

/** 키보드가 올라온 것으로 간주할 뷰포트 축소 임계값(px) */
const KEYBOARD_THRESHOLD = 150;

/**
 * 모바일 소프트 키보드가 올라와 있는지 감지하는 훅.
 *
 * VisualViewport API로 레이아웃 뷰포트 대비 실제 보이는 영역이 충분히 줄어들면
 * 키보드가 올라온 것으로 판단한다. (입력 요소 focus 여부와 무관하게 동작)
 *
 * VisualViewport를 지원하지 않는 환경에서는 항상 false를 반환한다.
 */
export function useKeyboardOpen(): boolean {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const handleResize = () => {
      const shrink = window.innerHeight - vv.height;
      setIsOpen(shrink > KEYBOARD_THRESHOLD);
    };

    handleResize();
    vv.addEventListener("resize", handleResize);
    return () => vv.removeEventListener("resize", handleResize);
  }, []);

  return isOpen;
}
