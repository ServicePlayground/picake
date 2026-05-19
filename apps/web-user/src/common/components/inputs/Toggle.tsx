"use client";

import clsx from "clsx";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  /** 스크린리더용 라벨 */
  ariaLabel?: string;
}

/**
 * iOS 스타일 토글(스위치). ON 시 primary 색상, OFF 시 회색.
 */
export function Toggle({ checked, onChange, disabled, ariaLabel }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={clsx(
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors",
        checked ? "bg-primary" : "bg-gray-200",
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      <span
        className={clsx(
          "inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-[22px]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}
