import * as React from "react";

import { cn } from "@/apps/web-admin/common/utils/classname.util";

const BaseInput = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, onClick, ...props }, ref) => {
    const handleClick = (event: React.MouseEvent<HTMLInputElement>) => {
      onClick?.(event);
      if (type !== "date") {
        return;
      }

      const input = event.currentTarget as HTMLInputElement & {
        showPicker?: () => void;
      };
      try {
        input.showPicker?.();
      } catch {
        // showPicker 미지원 브라우저는 기본 동작을 사용합니다.
      }
    };

    return (
      <input
        type={type}
        onClick={handleClick}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
BaseInput.displayName = "BaseInput";

export { BaseInput };
