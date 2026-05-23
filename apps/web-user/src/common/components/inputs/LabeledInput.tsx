import { forwardRef, useState } from "react";
import clsx from "clsx";
import { Icon } from "@/apps/web-user/common/components/icons";

interface LabeledInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "id"> {
  id: string;
  label: string;
  className?: string;
  inputClassName?: string;
  /** 포커스 + 값이 있을 때 입력 우측에 X 버튼 노출 */
  clearable?: boolean;
  onClear?: () => void;
}

export const LabeledInput = forwardRef<HTMLInputElement, LabeledInputProps>(function LabeledInput(
  { id, label, className, inputClassName, clearable, onClear, value, onFocus, onBlur, ...rest },
  ref,
) {
  const [isFocused, setIsFocused] = useState(false);
  const showClear = clearable && isFocused && !!value;

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-bold text-gray-900 mb-2.5">
        {label}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={id}
          value={value}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...rest}
          className={clsx(
            "w-full h-[42px] px-3 border border-gray-100 rounded-lg text-sm text-gray-900 placeholder:text-gray-300 outline-none",
            showClear && "pr-10",
            inputClassName,
          )}
        />
        {showClear && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center"
            aria-label="입력 지우기"
          >
            <Icon name="closeCircle" width={20} height={20} className="text-gray-300" />
          </button>
        )}
      </div>
    </div>
  );
});
