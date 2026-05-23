"use client";

import type { ReactNode } from "react";
import clsx from "clsx";
import { Icon } from "@/apps/web-user/common/components/icons";

/**
 * 커스텀 Checkbox 컴포넌트
 * - 내부적으로 실제 <input type="checkbox">를 렌더링(a11y) 후 시각적 표시는 Icon으로 커스터마이즈
 * - label을 통해 input과 텍스트가 연결되어 키보드/스크린리더 접근 가능
 * - RadioGroup과 동일한 톤: gap-1.5, sr-only input, 시각 표시는 별도 요소
 *
 * @example
 * <Checkbox checked={agreed} onChange={setAgreed} label="이용약관에 동의합니다" />
 */
interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: ReactNode;
  disabled?: boolean;
  id?: string;
  name?: string;
  className?: string;
}

export const Checkbox = ({
  checked,
  onChange,
  label,
  disabled = false,
  id,
  name,
  className,
}: CheckboxProps) => {
  return (
    <label
      className={clsx(
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
      <Icon
        name={checked ? "checkboxSmallSelected" : "checkboxSmallDefault"}
        width={16}
        height={16}
        className="shrink-0"
        aria-hidden
      />
      {label && <span className="text-sm text-gray-900">{label}</span>}
    </label>
  );
};
