import { useEffect } from "react";
import { BaseButton as Button } from "@/apps/web-seller/common/components/buttons/BaseButton";
import { useConfirmStore } from "@/apps/web-seller/common/store/confirm.store";

export function ConfirmAlert() {
  const { confirm, hideConfirm } = useConfirmStore();

  const handleCancel = () => {
    confirm.onCancel?.();
    hideConfirm();
  };

  const handleConfirm = () => {
    confirm.onConfirm?.();
    hideConfirm();
  };

  useEffect(() => {
    if (!confirm.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCancel();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [confirm.isOpen, confirm.onCancel]);

  if (!confirm.isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onClick={handleCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={confirm.title}
        aria-describedby="confirm-alert-message"
        className="w-full max-w-[360px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex min-h-[96px] items-center justify-center bg-white px-6 pt-6 pb-2">
          <p
            id="confirm-alert-message"
            className="text-center text-[13px] leading-[1.6] text-slate-700"
          >
            {confirm.message}
          </p>
        </div>

        <div className="flex min-h-[60px] items-center justify-center gap-2.5 bg-white px-5 pb-5 pt-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-w-[72px]"
            onClick={handleCancel}
          >
            {confirm.cancelLabel}
          </Button>
          <Button type="button" size="sm" className="min-w-[72px]" onClick={handleConfirm}>
            {confirm.confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
