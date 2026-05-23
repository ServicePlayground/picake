import React from "react";
import { BaseInput } from "@/apps/web-admin/common/components/inputs/BaseInput";
import { Label } from "@/apps/web-admin/common/components/labels/Label";
import { cn } from "@/apps/web-admin/common/utils/classname.util";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <Label className="block mb-2 text-sm font-medium text-foreground">{label}</Label>}
        <BaseInput
          ref={ref}
          className={cn(
            "h-12 rounded-md px-4 text-base transition-colors",
            error && "border-destructive focus-visible:ring-destructive",
            className,
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-destructive mb-0">{error}</p>}
      </div>
    );
  },
);
Input.displayName = "Input";
