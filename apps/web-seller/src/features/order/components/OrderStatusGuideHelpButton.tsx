import React from "react";
import { CircleHelp } from "lucide-react";
import { cn } from "@/apps/web-seller/common/utils/classname.util";

interface OrderStatusGuideHelpButtonProps {
  onClick: () => void;
  className?: string;
  ariaLabel?: string;
  title?: string;
}

export const OrderStatusGuideHelpButton: React.FC<OrderStatusGuideHelpButtonProps> = ({
  onClick,
  className,
  ariaLabel = "주문 상태 안내 보기",
  title = "주문 상태 안내",
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full p-0.5 text-slate-400 transition-colors hover:bg-slate-200/80 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35",
        className,
      )}
      aria-label={ariaLabel}
      title={title}
    >
      <CircleHelp className="h-4 w-4" strokeWidth={2} aria-hidden />
    </button>
  );
};
