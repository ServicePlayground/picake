"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import clsx from "clsx";

interface DragHandleBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  /** 오버레이·시트 스택 순서 (기본 z-50) */
  zIndexClassName?: string;
  /** 핸들 드래그로 시트를 끌어내려 닫을 수 있는지 (기본 true). false면 위·아래 모두 드래그 비활성화 */
  draggable?: boolean;
  /** draggable=true일 때, 위쪽 러버밴드 드래그 허용 여부 (기본 false). draggable=false면 무시됨 */
  upwardDraggable?: boolean;
  /** 드래그 닫힘 임계값(px). 핸들에서 끌어내린 거리가 이 값보다 크면 onClose. 기본 80 */
  closeThresholdPx?: number;
}

/**
 * 상단 drag handle만 노출되는 헤더리스 바텀시트.
 * 콘텐츠 영역(children)은 padding 없이 렌더되니 호출부에서 자유롭게 레이아웃 구성.
 *
 * - draggable=true(기본): 핸들을 아래로 끌어내리면 일정 거리 이상에서 닫힘. 임계값 미만은 스냅백.
 * - draggable=false: 핸들은 시각 표시만 됨.
 *
 * 헤더(중앙 제목 + X 버튼)가 있는 표준 시트는 `BottomSheet` 사용.
 */
export function DragHandleBottomSheet({
  isOpen,
  onClose,
  children,
  zIndexClassName,
  draggable = true,
  upwardDraggable = false,
  closeThresholdPx = 80,
}: DragHandleBottomSheetProps) {
  const dragStartYRef = useRef<number | null>(null);
  const dragInitialUpOffsetRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  // 아래 드래그 일시 오프셋 (>=0). 닫기 임계값 판정 후 0으로 복귀.
  const [downDelta, setDownDelta] = useState(0);
  // 위 드래그로 확장된 영구 오프셋 (>=0). 손 떼도 유지됨. 시트 닫힐 때만 초기화.
  const [upOffset, setUpOffset] = useState(0);

  // ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // 바텀시트 열릴 때 body 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // 닫힐 때 드래그 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      dragStartYRef.current = null;
      dragInitialUpOffsetRef.current = 0;
      setIsDragging(false);
      setDownDelta(0);
      setUpOffset(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggable) return;
    dragStartYRef.current = e.clientY;
    dragInitialUpOffsetRef.current = upOffset;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggable || dragStartYRef.current === null) return;
    const rawDelta = e.clientY - dragStartYRef.current;
    // 시작 시점의 영구 확장(initialUp) 기준으로 위/아래 드래그를 누적
    // rawDelta < 0 (위) → newUp 증가, rawDelta > 0 (아래) → newUp 감소 후 음수면 closing
    let newUp = dragInitialUpOffsetRef.current - rawDelta;

    if (!upwardDraggable && newUp > dragInitialUpOffsetRef.current) {
      // 위 드래그 비허용 → initial 위치 이상으로는 못 늘림
      newUp = dragInitialUpOffsetRef.current;
    }

    if (newUp >= 0) {
      setUpOffset(newUp);
      setDownDelta(0);
    } else {
      // 영구 확장이 다 깎이고 rest 아래까지 내려감 → 닫기 후보
      setUpOffset(0);
      setDownDelta(-newUp);
    }
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>, shouldClose: boolean) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // pointerCapture가 안 잡혀있으면 무시
    }
    dragStartYRef.current = null;
    setIsDragging(false);
    if (shouldClose) {
      onClose();
    } else {
      // 아래 드래그분만 0으로 스냅백. 위 확장(upOffset)은 그대로 stick.
      setDownDelta(0);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggable || dragStartYRef.current === null) return;
    endDrag(e, downDelta > closeThresholdPx);
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggable || dragStartYRef.current === null) return;
    endDrag(e, false);
  };

  // 아래 드래그(downDelta): translateY로 시트 전체 이동 (닫기 임계값 도달 시 onClose).
  // 위 드래그(upOffset): padding-bottom으로 시트 높이를 키움 → bottom-0 anchor 유지된 채 top edge만 위로.
  const sheetStyle: CSSProperties =
    isDragging || downDelta !== 0 || upOffset !== 0
      ? {
          transform: `translateY(${downDelta}px)`,
          paddingBottom: `${upOffset}px`,
          transition: isDragging ? "none" : "transform 0.2s ease-out, padding 0.2s ease-out",
        }
      : {};

  return (
    <div
      className={clsx("fixed inset-0 bg-black/50 transition-opacity", zIndexClassName ?? "z-50")}
      onClick={handleBackdropClick}
    >
      <div
        className="fixed bottom-0 left-0 right-0 max-w-[638px] mx-auto bg-white rounded-t-3xl flex flex-col animate-slide-up"
        style={sheetStyle}
      >
        {/* Drag handle */}
        <div
          className={clsx("flex justify-center pt-3 pb-1", draggable && "touch-none cursor-grab")}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
        >
          <div className="w-12 h-1 rounded-full bg-gray-200" aria-hidden />
        </div>

        {children}
      </div>
    </div>
  );
}
