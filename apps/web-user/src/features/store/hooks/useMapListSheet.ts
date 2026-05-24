"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { StoreInfo } from "@/apps/web-user/features/store/types/store.type";
import { isWebViewEnvironment } from "@/apps/web-user/common/utils/webview.bridge";
import {
  LIST_SHEET_HANDLE_HEIGHT,
  LIST_SHEET_OPEN_RATIO,
  LIST_SHEET_BOTTOM_NAV_HEIGHT,
  getMapLayoutViewportHeight,
  measureMapLayoutViewportHeightSync,
  sampleMapLayoutViewportHeight,
} from "@/apps/web-user/features/store/constants/map.constant";

/** 스냅 단계: 없음(0) / 중간 / 꽉채우기 */
function getSnapPoints(layoutHeight: number) {
  const middle = Math.round(layoutHeight * LIST_SHEET_OPEN_RATIO - LIST_SHEET_HANDLE_HEIGHT);
  const full = Math.round(
    layoutHeight - LIST_SHEET_BOTTOM_NAV_HEIGHT - LIST_SHEET_HANDLE_HEIGHT,
  );
  return { closed: 0, middle, full };
}

function measureLayoutHeight(): number {
  return isWebViewEnvironment()
    ? measureMapLayoutViewportHeightSync()
    : getMapLayoutViewportHeight();
}

function nearestAmong(current: number, candidates: number[]): number {
  let best = candidates[0] ?? 0;
  let bestDist = Math.abs(current - best);
  for (const p of candidates) {
    const d = Math.abs(current - p);
    if (d < bestDist) {
      bestDist = d;
      best = p;
    }
  }
  return best;
}

/** 드래그 시작 위치가 최상단(꽉 참)이었는지 — 캐시된 max 포함 */
function wasAtSheetTop(startOffset: number, maxOffsetAtDown: number, full: number): boolean {
  const top = Math.min(full, maxOffsetAtDown);
  return startOffset >= top - 2;
}

const PULL_DOWN_PX = 4;

/**
 * 손 뗀 뒤 스냅.
 * 꽉 찬 상태에서 아래로 당기면 무조건 middle(45%) — full·middle 사이에 멈추지 않음.
 */
function resolveSnapOffset(
  current: number,
  layoutHeight: number,
  startOffset: number,
  maxOffsetAtDown: number,
): number {
  const { closed, middle, full } = getSnapPoints(layoutHeight);

  if (wasAtSheetTop(startOffset, maxOffsetAtDown, full)) {
    if (current < startOffset - PULL_DOWN_PX) {
      return current < middle * 0.35 ? closed : middle;
    }
    return startOffset;
  }

  if (startOffset <= closed + 2 && current > closed + PULL_DOWN_PX) {
    return nearestAmong(current, [middle, full]);
  }

  const midBand = Math.abs(startOffset - middle) <= middle * 0.15 + 24;
  if (midBand) {
    if (current < startOffset - PULL_DOWN_PX) {
      return current < middle - PULL_DOWN_PX ? closed : middle;
    }
    if (current > startOffset + PULL_DOWN_PX) {
      return full;
    }
    return middle;
  }

  return nearestAmong(current, [closed, middle, full]);
}

export type OpenListSheetOptions = {
  deferInWebView?: boolean;
};

export function useMapListSheet(getStoresForList: () => StoreInfo[]) {
  const [listSheetStores, setListSheetStores] = useState<StoreInfo[]>([]);
  const [listSheetPanelOffset, setListSheetPanelOffset] = useState(0);
  const [isListSheetPanelDragging, setIsListSheetPanelDragging] = useState(false);

  const listSheetDragStartYRef = useRef<number | null>(null);
  const listSheetDragStartOffsetRef = useRef(0);
  const listSheetMaxOffsetAtDownRef = useRef(400);
  const listSheetPanelMaxOffsetRef = useRef(400);
  const listSheetPanelOffsetRef = useRef(0);
  const listSheetLayoutHeightRef = useRef<number | null>(null);
  const listSheetDraggingRef = useRef(false);

  /** 레이아웃 캐시만 갱신 (오프셋은 건드리지 않음) */
  const cacheLayoutMetrics = useCallback((): number => {
    const measured = measureLayoutHeight();
    listSheetLayoutHeightRef.current = measured;
    listSheetPanelMaxOffsetRef.current = getSnapPoints(measured).full;
    return measured;
  }, []);

  const applyLayoutHeight = useCallback((layoutHeight: number, preferOffset?: number) => {
    const current = listSheetPanelOffsetRef.current;
    const { middle, full } = getSnapPoints(layoutHeight);

    listSheetLayoutHeightRef.current = layoutHeight;
    listSheetPanelMaxOffsetRef.current = full;

    const target = preferOffset ?? (current <= 0 ? middle : current);
    if (Math.abs(current - target) < 1) return;
    listSheetPanelOffsetRef.current = target;
    setListSheetPanelOffset(target);
  }, []);

  const getListSheetMaxOffset = useCallback(() => {
    const h = listSheetLayoutHeightRef.current ?? measureLayoutHeight();
    return getSnapPoints(h).full;
  }, []);

  const getListSheetMiddleOffset = useCallback(() => {
    const h = listSheetLayoutHeightRef.current ?? measureLayoutHeight();
    return getSnapPoints(h).middle;
  }, []);

  const commitOpenListSheet = useCallback(() => {
    const stores = getStoresForList();
    setListSheetStores(stores);
    void sampleMapLayoutViewportHeight().then((layoutHeight) => {
      applyLayoutHeight(layoutHeight);
    });
  }, [getStoresForList, applyLayoutHeight]);

  const openListSheet = useCallback(
    (options?: OpenListSheetOptions) => {
      if (options?.deferInWebView && isWebViewEnvironment()) {
        requestAnimationFrame(() => requestAnimationFrame(commitOpenListSheet));
        return;
      }
      commitOpenListSheet();
    },
    [commitOpenListSheet],
  );

  const closeListSheet = useCallback(() => {
    listSheetLayoutHeightRef.current = null;
    listSheetPanelOffsetRef.current = 0;
    setListSheetPanelOffset(0);
  }, []);

  const handlePointerDown = useCallback(
    (clientY: number) => {
      listSheetMaxOffsetAtDownRef.current = listSheetPanelMaxOffsetRef.current;
      cacheLayoutMetrics();

      listSheetDragStartYRef.current = clientY;
      listSheetDragStartOffsetRef.current = listSheetPanelOffsetRef.current;
      listSheetDraggingRef.current = true;
      setIsListSheetPanelDragging(true);
      setListSheetStores(getStoresForList());
    },
    [cacheLayoutMetrics, getStoresForList],
  );

  const handlePointerMove = useCallback((clientY: number) => {
    const startY = listSheetDragStartYRef.current;
    if (startY == null) return;

    const layoutHeight = measureLayoutHeight();
    const maxOff = getSnapPoints(layoutHeight).full;
    listSheetPanelMaxOffsetRef.current = maxOff;
    listSheetLayoutHeightRef.current = layoutHeight;

    const startOff = listSheetDragStartOffsetRef.current;
    const deltaY = startY - clientY;
    const next = Math.max(0, Math.min(maxOff, startOff + deltaY));
    listSheetPanelOffsetRef.current = next;
    setListSheetPanelOffset(next);
  }, []);

  const handlePointerUp = useCallback(() => {
    listSheetDragStartYRef.current = null;
    listSheetDraggingRef.current = false;
    setIsListSheetPanelDragging(false);

    const layoutHeight = cacheLayoutMetrics();
    const current = listSheetPanelOffsetRef.current;
    const startOffset = listSheetDragStartOffsetRef.current;
    const maxAtDown = listSheetMaxOffsetAtDownRef.current;

    const snapped = resolveSnapOffset(current, layoutHeight, startOffset, maxAtDown);
    listSheetPanelOffsetRef.current = snapped;
    setListSheetPanelOffset(snapped);
  }, [cacheLayoutMetrics]);

  useEffect(() => {
    listSheetPanelOffsetRef.current = listSheetPanelOffset;
  }, [listSheetPanelOffset]);

  useEffect(() => {
    if (listSheetPanelOffset <= 0 || listSheetDraggingRef.current) return;

    const sync = () => {
      if (listSheetDraggingRef.current) return;
      const measured = measureLayoutHeight();
      const prev = listSheetLayoutHeightRef.current;
      if (prev == null || measured <= prev + 2) {
        cacheLayoutMetrics();
        return;
      }
      const current = listSheetPanelOffsetRef.current;
      const prevFull = getSnapPoints(prev).full;
      const { full: nextFull, middle: nextMiddle } = getSnapPoints(measured);
      listSheetLayoutHeightRef.current = measured;
      listSheetPanelMaxOffsetRef.current = nextFull;
      if (current >= prevFull - 2) {
        listSheetPanelOffsetRef.current = nextFull;
        setListSheetPanelOffset(nextFull);
      } else if (current >= getSnapPoints(prev).middle - 2 && current < prevFull - 24) {
        listSheetPanelOffsetRef.current = nextMiddle;
        setListSheetPanelOffset(nextMiddle);
      }
    };

    sync();
    const t = window.setTimeout(sync, 120);
    const t2 = isWebViewEnvironment() ? window.setTimeout(sync, 320) : undefined;

    window.visualViewport?.addEventListener("resize", sync);
    window.addEventListener("resize", sync);

    return () => {
      window.clearTimeout(t);
      if (t2 != null) window.clearTimeout(t2);
      window.visualViewport?.removeEventListener("resize", sync);
      window.removeEventListener("resize", sync);
    };
  }, [listSheetPanelOffset, cacheLayoutMetrics]);

  return {
    listSheetStores,
    setListSheetStores,
    listSheetPanelOffset,
    setListSheetPanelOffset,
    isListSheetPanelDragging,
    listSheetPanelOffsetRef,
    listSheetPanelMaxOffsetRef,
    getListSheetMaxOffset,
    getListSheetMiddleOffset,
    openListSheet,
    closeListSheet,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    LIST_SHEET_HANDLE_HEIGHT,
  };
}
