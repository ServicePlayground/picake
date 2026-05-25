import { cn } from "@/apps/web-admin/common/utils/classname.util";
import { LoadingSpinner } from "@/apps/web-admin/common/components/loading/LoadingSpinner";

export type ContentLoadingVariant = "inline" | "section" | "page";

export interface ContentLoadingProps {
  message?: string;
  variant?: ContentLoadingVariant;
  spinnerSize?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function ContentLoading({
  message = "불러오는 중…",
  variant = "section",
  spinnerSize,
  className,
}: ContentLoadingProps) {
  const size = spinnerSize ?? (variant === "inline" ? "sm" : variant === "page" ? "lg" : "md");

  if (variant === "inline") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 text-sm font-medium text-zinc-500",
          className,
        )}
        role="status"
        aria-live="polite"
      >
        <LoadingSpinner size={size} />
        <span>{message}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-10 text-center sm:py-12",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <LoadingSpinner size={size} />
      <p className="text-sm font-medium text-zinc-500">{message}</p>
    </div>
  );
}
