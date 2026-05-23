import type { ReactNode } from "react";
import { Check, Square } from "lucide-react";
import { cn } from "@/apps/web-seller/common/utils/classname.util";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: ReactNode;
  disabled?: boolean;
  id?: string;
  name?: string;
  className?: string;
}

export function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
  id,
  name,
  className,
}: CheckboxProps) {
  return (
    <label
      className={cn(
        "flex items-center gap-1.5",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        className,
      )}
    >
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only"
      />
      {checked ? (
        <Check className="size-4 shrink-0 text-zinc-900" strokeWidth={2.5} aria-hidden />
      ) : (
        <Square className="size-4 shrink-0 text-zinc-400" strokeWidth={2} aria-hidden />
      )}
      {label ? <span className="text-sm leading-5 text-zinc-900">{label}</span> : null}
    </label>
  );
}
