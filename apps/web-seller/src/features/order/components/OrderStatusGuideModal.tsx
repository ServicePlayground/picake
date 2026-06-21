import React, { useEffect } from "react";
import { BaseButton as Button } from "@/apps/web-seller/common/components/buttons/BaseButton";
import { X } from "lucide-react";
import type { OrderStatusGuideItem } from "@/apps/web-seller/features/order/utils/order-status-seller-guide.util";

interface OrderStatusGuideModalProps {
  open: boolean;
  onClose: () => void;
  /** 스크린 리더용 (화면에는 표시하지 않음) */
  ariaLabel?: string;
  items?: readonly OrderStatusGuideItem[];
  numberedLines?: readonly string[];
}

export const OrderStatusGuideModal: React.FC<OrderStatusGuideModalProps> = ({
  open,
  onClose,
  ariaLabel = "주문 상태 안내",
  items,
  numberedLines,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-[1px]"
        onClick={onClose}
        aria-label="안내 닫기"
      />
      <div
        className="relative z-10 flex max-h-[min(88vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-slate-300/90 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 z-10 h-8 w-8 shrink-0 text-slate-500 hover:text-slate-900"
          onClick={onClose}
          aria-label="닫기"
        >
          <X className="h-4 w-4" />
        </Button>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-10 sm:px-4">
          {items && items.length > 0 && (
            <ul className="space-y-3 text-[13px] leading-relaxed text-slate-700">
              {items.map((item) => (
                <li key={item.label}>
                  <p className="font-semibold text-slate-800">{item.label}</p>
                  <p className="mt-0.5">{item.description}</p>
                </li>
              ))}
            </ul>
          )}
          {numberedLines && numberedLines.length > 0 && (
            <ul className="space-y-2.5 text-[13px] leading-relaxed text-slate-700">
              {numberedLines.map((line, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-[11px] font-semibold text-slate-600">
                    {i + 1}
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
