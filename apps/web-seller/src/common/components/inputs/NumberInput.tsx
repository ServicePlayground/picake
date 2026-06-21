import * as React from "react";
import { BaseInput } from "@/apps/web-seller/common/components/inputs/BaseInput";
import { cn } from "@/apps/web-seller/common/utils/classname.util";

export interface NumberInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange"
> {
  /** undefined면 빈 칸 표시(필터 등 선택 입력용) */
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  min?: number;
  max?: number;
  step?: number;
  integer?: boolean;
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ value, onChange, className, integer = true, inputMode, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      if (rawValue.trim() === "") {
        onChange(undefined); // 비어 있는 값은 undefined로 전달, 상위에서 변환
        return;
      }

      // type="text"에서도 숫자 검증이 동작하도록 숫자 이외 문자를 제거한 뒤 파싱한다.
      const sanitized = integer
        ? rawValue.replace(/[^\d-]/g, "")
        : rawValue.replace(/[^\d.-]/g, "");
      const parsed = integer ? parseInt(sanitized, 10) : parseFloat(sanitized);

      if (Number.isNaN(parsed)) {
        onChange(undefined);
        return;
      }
      onChange(parsed); // 숫자 값은 그대로 전달
    };

    const displayValue = value === undefined ? "" : String(value);

    return (
      <BaseInput
        ref={ref}
        type="text"
        inputMode={inputMode ?? (integer ? "numeric" : "decimal")}
        className={cn(className)}
        value={displayValue}
        onChange={handleChange}
        {...props}
      />
    );
  },
);
NumberInput.displayName = "NumberInput";

export { NumberInput };
