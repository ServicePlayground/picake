"use client";

import React, { useEffect } from "react";
import clsx from "clsx";
import { Button } from "@/apps/web-user/common/components/buttons/Button";

type ButtonVariant = "primary" | "secondary" | "outline" | "red";

interface ModalProps {
  /** 모달 열림 상태 */
  isOpen: boolean;
  /** 모달 닫기 핸들러 */
  onClose: () => void;
  /** 모달 제목 */
  title: string;
  /** 모달 설명 */
  description?: React.ReactNode;
  /** 확인 버튼 텍스트 */
  confirmText?: string;
  /** 취소 버튼 텍스트 */
  cancelText?: string;
  /** 확인 버튼 스타일 (기본값: "outline") */
  confirmVariant?: ButtonVariant;
  /** 취소 버튼 스타일 (기본값: "red") */
  cancelVariant?: ButtonVariant;
  /** 확인 버튼 클릭 핸들러 */
  onConfirm?: () => void;
  /** 취소 버튼 클릭 핸들러 */
  onCancel?: () => void;
  /** 확인 버튼 flex 비율 (기본값: 1) */
  confirmFlex?: number;
  /** 취소 버튼 flex 비율 (기본값: 1) */
  cancelFlex?: number;
  /** 취소 버튼 숨김 (기본값: false) */
  hideCancel?: boolean;
  /** 오버레이·모달 스택 순서 (기본 z-[100]) */
  zIndexClassName?: string;
}

/**
 * 공통 Modal 컴포넌트
 *
 * @example
 * <Modal
 *   isOpen={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   title="작성을 취소하시겠습니까?"
 *   description="작성 중인 내용이 저장되지 않습니다."
 *   confirmText="계속 진행하기"
 *   cancelText="취소"
 *   onConfirm={() => setIsModalOpen(false)}
 *   onCancel={handleCancel}
 * />
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  confirmText = "확인",
  cancelText = "취소",
  confirmVariant = "outline",
  cancelVariant = "red",
  onConfirm,
  onCancel,
  confirmFlex = 1,
  cancelFlex = 1,
  hideCancel = false,
  zIndexClassName,
}) => {
  // ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  const handleCancel = () => {
    onCancel?.();
  };

  return (
    <div
      className={clsx(
        "fixed inset-0 flex items-center justify-center",
        zIndexClassName ?? "z-[100]",
      )}
    >
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />

      {/* 모달 컨텐츠 */}
      <div className="relative z-10 w-[calc(100%-40px)] max-w-[320px] bg-white rounded-2xl px-[20px] pt-[36px]">
        <div className="text-center py-[12px]">
          <h2 className="text-base font-bold text-gray-900 mb-[8px] break-keep">{title}</h2>
          {description && <div className="text-sm text-gray-700 break-keep">{description}</div>}
        </div>

        <div className="flex gap-[8px] py-[20px]">
          <span style={{ flex: confirmFlex }}>
            <Button
              variant={confirmVariant}
              onClick={handleConfirm}
              className="break-keep leading-[1.2]"
            >
              {confirmText}
            </Button>
          </span>
          {!hideCancel && (
            <span style={{ flex: cancelFlex }}>
              <Button
                onClick={handleCancel}
                variant={cancelVariant}
                className="break-keep leading-[1.2]"
              >
                {cancelText}
              </Button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
