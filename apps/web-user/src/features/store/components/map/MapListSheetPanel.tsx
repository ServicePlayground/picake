"use client";

import { ReactNode, useCallback, useEffect, useRef } from "react";
import {
  LIST_SHEET_HANDLE_HEIGHT,
  MAP_STORE_LIST_FILTER_MODAL_ID,
} from "@/apps/web-user/features/store/constants/map.constant";

function isInsideMapListFilterModal(target: EventTarget | null): boolean {
  if (typeof document === "undefined" || !(target instanceof Node)) return false;
  const modal = document.getElementById(MAP_STORE_LIST_FILTER_MODAL_ID);
  return modal?.contains(target) ?? false;
}

/** 목록 영역에서 시트 드래그로 인식하기 전 최소 이동(px) */
const CONTENT_SHEET_DRAG_THRESHOLD = 8;

interface MapListSheetPanelProps {
  /** 패널 오프셋(px). 0이면 핸들만 보임 */
  offset: number;
  /** true면 최상단까지 펼친 상태(상단 모서리 직각) */
  expandedToTop?: boolean;
  /** 필터 모달이 열려 있을 때 목록 영역 드래그·스크롤 제스처 비활성화 */
  disableContentGestures?: boolean;
  isDragging: boolean;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  /** 시트 드래그(핸들·목록 공통) — 목록은 스크롤과 구분 후 호출 */
  sheetPointerDown: (clientY: number) => void;
  sheetPointerMove: (clientY: number) => void;
  sheetPointerUp: () => void;
  children: ReactNode;
}

type ContentGestureMode = "undecided" | "sheet" | "scroll";

export function MapListSheetPanel({
  offset,
  expandedToTop = false,
  disableContentGestures = false,
  isDragging,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onMouseDown,
  sheetPointerDown,
  sheetPointerMove,
  sheetPointerUp,
  children,
}: MapListSheetPanelProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const contentGestureRef = useRef<{
    mode: ContentGestureMode;
    startY: number;
    startScrollTop: number;
  } | null>(null);

  const resetContentGesture = useCallback(() => {
    contentGestureRef.current = null;
    const el = scrollRef.current;
    if (el) el.style.touchAction = "";
  }, []);

  const canScrollListVertically = useCallback((el: HTMLDivElement) => {
    return el.scrollHeight > el.clientHeight + 1;
  }, []);

  useEffect(() => {
    if (!disableContentGestures) return;
    const g = contentGestureRef.current;
    if (g?.mode === "sheet") {
      sheetPointerUp();
    }
    resetContentGesture();
  }, [disableContentGestures, resetContentGesture, sheetPointerUp]);

  /** 목록 영역 터치: 스크롤 가능하면 스크롤, 맨 위·짧은 목록이면 시트와 동일하게 드래그 */
  const onContentTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disableContentGestures || isInsideMapListFilterModal(e.target)) return;
      const el = scrollRef.current;
      if (!el) return;
      const startScrollTop = el.scrollTop;
      if (startScrollTop > 0) {
        contentGestureRef.current = { mode: "scroll", startY: e.touches[0].clientY, startScrollTop };
        return;
      }
      contentGestureRef.current = {
        mode: "undecided",
        startY: e.touches[0].clientY,
        startScrollTop: 0,
      };
    },
    [disableContentGestures],
  );

  const onContentTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (disableContentGestures || isInsideMapListFilterModal(e.target)) return;
      const g = contentGestureRef.current;
      const el = scrollRef.current;
      if (!g || !el) return;

      if (g.mode === "sheet") {
        e.preventDefault();
        sheetPointerMove(e.touches[0].clientY);
        return;
      }
      if (g.mode === "scroll") return;

      const st = el.scrollTop;
      if (st > 0) {
        g.mode = "scroll";
        return;
      }

      const clientY = e.touches[0].clientY;
      const dy = clientY - g.startY;
      if (Math.abs(dy) < CONTENT_SHEET_DRAG_THRESHOLD) return;

      if (dy < 0) {
        g.mode = "sheet";
        el.style.touchAction = "none";
        e.preventDefault();
        sheetPointerDown(g.startY);
        sheetPointerMove(clientY);
        return;
      }

      if (canScrollListVertically(el)) {
        g.mode = "scroll";
        return;
      }

      g.mode = "sheet";
      el.style.touchAction = "none";
      e.preventDefault();
      sheetPointerDown(g.startY);
      sheetPointerMove(clientY);
    },
    [canScrollListVertically, disableContentGestures, sheetPointerDown, sheetPointerMove],
  );

  const onContentTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (disableContentGestures || isInsideMapListFilterModal(e.target)) return;
      const g = contentGestureRef.current;
      if (g?.mode === "sheet") {
        e.preventDefault();
        sheetPointerUp();
      }
      resetContentGesture();
    },
    [disableContentGestures, resetContentGesture, sheetPointerUp],
  );

  const onContentMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disableContentGestures || isInsideMapListFilterModal(e.target)) return;
      if (e.button !== 0) return;
      const el = scrollRef.current;
      if (!el) return;

      const startY = e.clientY;
      const startScrollTop = el.scrollTop;
      let mode: ContentGestureMode = startScrollTop > 0 ? "scroll" : "undecided";

      const cleanup = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        el.style.touchAction = "";
      };

      const onUp = () => {
        if (mode === "sheet") sheetPointerUp();
        cleanup();
      };

      const onMove = (moveEvent: MouseEvent) => {
        if (mode === "sheet") {
          sheetPointerMove(moveEvent.clientY);
          return;
        }
        if (mode === "scroll") return;

        const st = el.scrollTop;
        if (st > 0) {
          mode = "scroll";
          return;
        }

        const dy = moveEvent.clientY - startY;
        if (Math.abs(dy) < CONTENT_SHEET_DRAG_THRESHOLD) return;

        if (dy < 0) {
          mode = "sheet";
          el.style.touchAction = "none";
          sheetPointerDown(startY);
          sheetPointerMove(moveEvent.clientY);
          return;
        }

        if (canScrollListVertically(el)) {
          mode = "scroll";
          return;
        }

        mode = "sheet";
        el.style.touchAction = "none";
        sheetPointerDown(startY);
        sheetPointerMove(moveEvent.clientY);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [canScrollListVertically, disableContentGestures, sheetPointerDown, sheetPointerMove, sheetPointerUp],
  );

  return (
    <div
      className="fixed left-0 right-0 bottom-[60px] z-50 flex flex-col max-w-[638px] mx-auto overflow-hidden"
      style={{
        height: LIST_SHEET_HANDLE_HEIGHT + offset,
        transition: isDragging ? "none" : "height 0.25s ease-out",
        background: "#FFFFFF",
        borderRadius: expandedToTop && !isDragging ? 0 : "20px 20px 0 0",
      }}
      aria-label="목록 패널"
    >
      <div
        role="presentation"
        className="shrink-0 flex h-8 items-center justify-center cursor-grab active:cursor-grabbing touch-none py-[13px]"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        onMouseDown={onMouseDown}
        style={{ touchAction: "none" }}
      >
        <div
          className="rounded-full bg-gray-200 shrink-0"
          style={{ width: 56, height: 6 }}
          aria-hidden
        />
      </div>
      <div
        ref={scrollRef}
        className={`flex-1 min-h-0 overflow-y-auto overscroll-contain flex flex-col ${disableContentGestures ? "" : "cursor-grab active:cursor-grabbing"}`}
        style={{ WebkitOverflowScrolling: "touch" }}
        onTouchStart={onContentTouchStart}
        onTouchMove={onContentTouchMove}
        onTouchEnd={onContentTouchEnd}
        onTouchCancel={onContentTouchEnd}
        onMouseDown={onContentMouseDown}
      >
        {children}
      </div>
    </div>
  );
}
