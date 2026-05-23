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

type SnapStage = "closed" | "middle" | "full";

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

/** 후보들 중 current와 가장 가까운 스냅 포인트 */
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

/**
 * 오프셋이 어느 스냅 단계인지.
 * 웹뷰에서는 캐시된 max보다 작은 full 오프셋에 멈춰도 '꽉 참'으로 본다.
 */
function getSnapStage(
  offset: number,
  layoutHeight: number,
  previousMaxOffset?: number,
): SnapStage {
  const { middle, full } = getSnapPoints(layoutHeight);
  const atCachedMax =
    previousMaxOffset != null && offset >= previousMaxOffset - 2;
  if (offset >= full - 2 || atCachedMax) return "full";
  if (offset >= middle - 2) return "middle";
  return "closed";
}

const SNAP_INTENT_PX = 16;

/** 레이아웃 높이가 커졌을 때 기존 오프셋을 새 스냅 단계에 맞게 보정 */
function remapOffsetForLayoutHeightChange(
  currentOffset: number,
  prevLayoutHeight: number,
  nextLayoutHeight: number,
  previousMaxOffset: number,
): number {
  const prev = getSnapPoints(prevLayoutHeight);
  const next = getSnapPoints(nextLayoutHeight);
  if (currentOffset >= previousMaxOffset - 2 || currentOffset >= prev.full - 1) {
    return next.full;
  }
  if (currentOffset >= prev.middle - 1) return next.middle;
  return nearestAmong(currentOffset, [0, next.middle, next.full]);
}

/** 드래그 시작 시 스냅 단계 + 손 뗐을 때 위치로 스냅할 값 결정 */
function resolveSnap(
  current: number,
  stageAtDown: SnapStage,
  layoutHeight: number,
  startOffset: number,
): number {
  const { closed, middle, full } = getSnapPoints(layoutHeight);

  if (stageAtDown === "full" && current < full - SNAP_INTENT_PX) {
    if (current < middle * 0.35) return closed;
    return middle;
  }
  if (stageAtDown === "closed" && current > closed + SNAP_INTENT_PX) {
    return nearestAmong(current, [middle, full]);
  }
  if (stageAtDown === "middle") {
    if (current < startOffset - SNAP_INTENT_PX) {
      return current < middle - SNAP_INTENT_PX ? closed : middle;
    }
    if (current > startOffset + SNAP_INTENT_PX) {
      return full;
    }
    return middle;
  }
  return nearestAmong(current, [closed, middle, full]);
}

export type OpenListSheetOptions = {
  /** 웹뷰에서 레이아웃이 안정된 뒤 열기 (검색 후 목록 시트) */
  deferInWebView?: boolean;
};

/**
 * 지도 하단 목록 시트(드래그 패널) 상태 및 제스처 처리
 * 3단계: 없음(0) / 중간(45vh) / 꽉채우기(화면 상단까지)
 */
export function useMapListSheet(getStoresForList: () => StoreInfo[]) {
  const [listSheetStores, setListSheetStores] = useState<StoreInfo[]>([]);
  const [listSheetPanelOffset, setListSheetPanelOffset] = useState(0);
  const [isListSheetPanelDragging, setIsListSheetPanelDragging] = useState(false);

  const listSheetDragStartYRef = useRef<number | null>(null);
  const listSheetDragStartOffsetRef = useRef(0);
  const listSheetSnapStageAtPointerDownRef = useRef<SnapStage>("closed");
  const listSheetPanelMaxOffsetRef = useRef(400);
  const listSheetPanelOffsetRef = useRef(0);
  const listSheetLayoutHeightRef = useRef<number | null>(null);

  const applyLayoutHeight = useCallback((layoutHeight: number, preferOffset?: number) => {
    const prevHeight = listSheetLayoutHeightRef.current;
    const prevMax = listSheetPanelMaxOffsetRef.current;
    const current = listSheetPanelOffsetRef.current;
    const { middle, full } = getSnapPoints(layoutHeight);

    listSheetLayoutHeightRef.current = layoutHeight;
    listSheetPanelMaxOffsetRef.current = full;

    let target = preferOffset ?? middle;
    if (preferOffset === undefined) {
      if (current <= 0) {
        target = middle;
      } else if (prevHeight != null && prevHeight < layoutHeight - 2) {
        target = remapOffsetForLayoutHeightChange(
          current,
          prevHeight,
          layoutHeight,
          prevMax,
        );
      } else {
        target = current;
      }
    }

    if (Math.abs(current - target) < 1) return;
    listSheetPanelOffsetRef.current = target;
    setListSheetPanelOffset(target);
  }, []);

  const refreshLayoutHeightIfGrown = useCallback(() => {
    const measured = measureLayoutHeight();
    const prev = listSheetLayoutHeightRef.current;
    if (prev == null) {
      listSheetLayoutHeightRef.current = measured;
      listSheetPanelMaxOffsetRef.current = getSnapPoints(measured).full;
      return measured;
    }
    if (measured <= prev + 2) return prev;

    const prevMax = listSheetPanelMaxOffsetRef.current;
    const current = listSheetPanelOffsetRef.current;
    const { full: nextFull } = getSnapPoints(measured);
    const nextOffset =
      current >= prevMax - 2
        ? nextFull
        : remapOffsetForLayoutHeightChange(current, prev, measured, prevMax);

    listSheetLayoutHeightRef.current = measured;
    listSheetPanelMaxOffsetRef.current = nextFull;
    if (Math.abs(current - nextOffset) >= 1) {
      listSheetPanelOffsetRef.current = nextOffset;
      setListSheetPanelOffset(nextOffset);
    }
    return measured;
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
      const prevMax = listSheetPanelMaxOffsetRef.current;
      const layoutHeight = refreshLayoutHeightIfGrown();
      const { full } = getSnapPoints(layoutHeight);
      listSheetPanelMaxOffsetRef.current = full;

      const offset = listSheetPanelOffsetRef.current;
      listSheetDragStartYRef.current = clientY;
      listSheetDragStartOffsetRef.current = offset;
      listSheetSnapStageAtPointerDownRef.current = getSnapStage(
        offset,
        layoutHeight,
        prevMax,
      );
      setIsListSheetPanelDragging(true);
      setListSheetStores(getStoresForList());
    },
    [refreshLayoutHeightIfGrown, getStoresForList],
  );

  const handlePointerMove = useCallback((clientY: number) => {
    const startY = listSheetDragStartYRef.current;
    if (startY == null) return;
    const maxOff = listSheetPanelMaxOffsetRef.current;
    const startOff = listSheetDragStartOffsetRef.current;
    const deltaY = startY - clientY;
    const next = Math.max(0, Math.min(maxOff, startOff + deltaY));
    listSheetPanelOffsetRef.current = next;
    setListSheetPanelOffset(next);
  }, []);

  const handlePointerUp = useCallback(() => {
    listSheetDragStartYRef.current = null;
    setIsListSheetPanelDragging(false);

    const layoutHeight = refreshLayoutHeightIfGrown();
    const current = listSheetPanelOffsetRef.current;
    const stageAtDown = listSheetSnapStageAtPointerDownRef.current;
    const startOffset = listSheetDragStartOffsetRef.current;
    const snapped = resolveSnap(current, stageAtDown, layoutHeight, startOffset);
    listSheetPanelOffsetRef.current = snapped;
    setListSheetPanelOffset(snapped);
  }, [refreshLayoutHeightIfGrown]);

  useEffect(() => {
    listSheetPanelOffsetRef.current = listSheetPanelOffset;
  }, [listSheetPanelOffset]);

  useEffect(() => {
    if (listSheetPanelOffset <= 0) return;

    const sync = () => refreshLayoutHeightIfGrown();
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
  }, [listSheetPanelOffset, refreshLayoutHeightIfGrown]);

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
