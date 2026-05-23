"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { StoreInfo } from "@/apps/web-user/features/store/types/store.type";
import { isWebViewEnvironment } from "@/apps/web-user/common/utils/webview.bridge";
import {
  LIST_SHEET_HANDLE_HEIGHT,
  LIST_SHEET_OPEN_RATIO,
  LIST_SHEET_BOTTOM_NAV_HEIGHT,
  getMapLayoutViewportHeight,
} from "@/apps/web-user/features/store/constants/map.constant";

/** 스냅 단계: 없음(0) / 중간 / 꽉채우기 */
function getSnapPoints(layoutHeight: number) {
  const middle = Math.round(layoutHeight * LIST_SHEET_OPEN_RATIO - LIST_SHEET_HANDLE_HEIGHT);
  const full = Math.round(
    layoutHeight - LIST_SHEET_BOTTOM_NAV_HEIGHT - LIST_SHEET_HANDLE_HEIGHT,
  );
  return { closed: 0, middle, full };
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

/** 드래그 시작 시 스냅 단계(오프셋 값) + 손 뗐을 때 위치로 스냅할 값 결정 */
function resolveSnap(current: number, snapAtPointerDown: number, layoutHeight: number): number {
  const { closed, middle, full } = getSnapPoints(layoutHeight);
  if (snapAtPointerDown === full && current < full) {
    return nearestAmong(current, [closed, middle]);
  }
  if (snapAtPointerDown === closed && current > closed) {
    return nearestAmong(current, [middle, full]);
  }
  if (snapAtPointerDown === middle && current < middle) {
    return closed;
  }
  if (snapAtPointerDown === middle && current > middle) {
    return full;
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
 * 드래그 후 손을 떼면 가장 가까운 단계로 스냅 (살짝만 움직여도 인접 단계로 이동)
 */
export function useMapListSheet(getStoresForList: () => StoreInfo[]) {
  const [listSheetStores, setListSheetStores] = useState<StoreInfo[]>([]);
  const [listSheetPanelOffset, setListSheetPanelOffset] = useState(0);
  const [isListSheetPanelDragging, setIsListSheetPanelDragging] = useState(false);

  const listSheetDragStartYRef = useRef<number | null>(null);
  const listSheetDragStartOffsetRef = useRef(0);
  const listSheetSnapAtPointerDownRef = useRef(0);
  const listSheetPanelMaxOffsetRef = useRef(400);
  const listSheetPanelOffsetRef = useRef(0);
  /** 시트가 열려 있는 동안 스냅 계산에 쓰는 고정 레이아웃 높이 (웹뷰 높이 변동 방지) */
  const listSheetLayoutHeightRef = useRef<number | null>(null);

  const ensureListSheetLayoutHeight = useCallback(() => {
    if (listSheetLayoutHeightRef.current == null) {
      listSheetLayoutHeightRef.current = getMapLayoutViewportHeight();
    }
    return listSheetLayoutHeightRef.current;
  }, []);

  const getListSheetMaxOffset = useCallback(() => {
    return getSnapPoints(ensureListSheetLayoutHeight()).full;
  }, [ensureListSheetLayoutHeight]);

  const getListSheetMiddleOffset = useCallback(() => {
    return getSnapPoints(ensureListSheetLayoutHeight()).middle;
  }, [ensureListSheetLayoutHeight]);

  const commitOpenListSheet = useCallback(() => {
    const stores = getStoresForList();
    setListSheetStores(stores);
    const layoutHeight = ensureListSheetLayoutHeight();
    const { middle, full } = getSnapPoints(layoutHeight);
    listSheetPanelMaxOffsetRef.current = full;
    if (Math.abs(listSheetPanelOffsetRef.current - middle) < 1) {
      return;
    }
    listSheetPanelOffsetRef.current = middle;
    setListSheetPanelOffset(middle);
  }, [getStoresForList, ensureListSheetLayoutHeight]);

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
      ensureListSheetLayoutHeight();
      listSheetPanelMaxOffsetRef.current = getListSheetMaxOffset();
      listSheetDragStartYRef.current = clientY;
      listSheetDragStartOffsetRef.current = listSheetPanelOffset;
      listSheetSnapAtPointerDownRef.current = nearestAmong(listSheetPanelOffset, [
        0,
        getListSheetMiddleOffset(),
        getListSheetMaxOffset(),
      ]);
      setIsListSheetPanelDragging(true);
      setListSheetStores(getStoresForList());
    },
    [
      ensureListSheetLayoutHeight,
      getListSheetMaxOffset,
      getListSheetMiddleOffset,
      listSheetPanelOffset,
      getStoresForList,
    ],
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
    const layoutHeight = ensureListSheetLayoutHeight();
    const current = listSheetPanelOffsetRef.current;
    const snapAtDown = listSheetSnapAtPointerDownRef.current;
    const snapped = resolveSnap(current, snapAtDown, layoutHeight);
    listSheetPanelOffsetRef.current = snapped;
    setListSheetPanelOffset(snapped);
  }, [ensureListSheetLayoutHeight]);

  useEffect(() => {
    listSheetPanelOffsetRef.current = listSheetPanelOffset;
  }, [listSheetPanelOffset]);

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
