import { Loader2 } from "lucide-react";
import { cn } from "@/apps/web-admin/common/utils/classname.util";

const sizeClass = {
  sm: "size-4",
  md: "size-6",
  lg: "size-8",
  xl: "size-10",
} as const;

export interface LoadingSpinnerProps {
  size?: keyof typeof sizeClass;
  className?: string;
  "aria-hidden"?: boolean;
  "aria-label"?: string;
}

/** 앱 전역에서 쓰는 스피너 (zinc 톤) */
export function LoadingSpinner({
  size = "md",
  className,
  "aria-hidden": ariaHidden,
  "aria-label": ariaLabel = "로딩 중",
}: LoadingSpinnerProps) {
  return (
    <Loader2
      role="status"
      aria-hidden={ariaHidden}
      aria-label={ariaHidden ? undefined : ariaLabel}
      className={cn("shrink-0 animate-spin text-zinc-500", sizeClass[size], className)}
    />
  );
}
