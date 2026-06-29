"use client";

import React from "react";
import { cn } from "@/apps/web-user/common/lib/utils";

/**
 * Radio 옵션 타입
 */
export interface RadioOption<T = string> {
  value: T;
  label: string;
}

/**
 * 커스텀 Radio 그룹 컴포넌트
 * - 내부적으로 실제 <input type="radio">를 렌더링(a11y) 후 시각적 표시는 span으로 커스터마이즈
 * - label을 통해 input과 텍스트가 연결되어 키보드/스크린리더 접근 가능
 *
 * @example
 * <RadioGroup
 *   value={reason}
 *   onChange={setReason}
 *   label="취소사유"
 *   options={[
 *     { value: "CHANGE_OF_MIND", label: "단순 변심" },
 *     { value: "ORDER_MISTAKE", label: "주문 실수 (디자인 변경, 옵션 누락 등)" },
 *     { value: "OTHER", label: "기타" },
 *   ]}
 * />
 */
interface RadioGroupProps<T = string> {
  /** 선택된 값 (null 이면 미선택 상태) */
  value: T | null;
  /** 값 변경 핸들러 */
  onChange: (value: T) => void;
  /** 옵션 목록 */
  options: RadioOption<T>[];
  /** 라벨 텍스트 */
  label?: string;
  /** 에러 메시지 */
  error?: string;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 라디오 그룹 name (form 제출 시 동일 그룹핑용. 미지정 시 자동 생성) */
  name?: string;
  /** 컨테이너 추가 클래스명 */
  className?: string;
  /** 라벨 추가 클래스명 (기본 스타일 오버라이드용) */
  labelClassName?: string;
}

export const RadioGroup = <T extends string | number = string>({
  value,
  onChange,
  options,
  label,
  error,
  disabled = false,
  name,
  className = "",
  labelClassName = "",
}: RadioGroupProps<T>) => {
  const autoName = React.useId();
  const groupName = name ?? autoName;

  return (
    <div className={`w-full ${className}`.trim()}>
      {label && (
        <p
          className={cn("block mb-[10px] text-sm font-bold text-gray-900", labelClassName)}
        >
          {label}
        </p>
      )}
      <div className="flex flex-col gap-2.5">
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <label
              key={String(option.value)}
              className={`flex items-center gap-1.5 ${
                disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
              }`}
            >
              <input
                type="radio"
                name={groupName}
                value={String(option.value)}
                checked={isSelected}
                onChange={() => onChange(option.value)}
                disabled={disabled}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                  isSelected ? "border-primary bg-primary" : "border-gray-300 bg-white"
                }`}
              >
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </span>
              <span className="text-sm text-gray-900">{option.label}</span>
            </label>
          );
        })}
      </div>
      {error && <p className="mt-[6px] text-xs text-red-400">{error}</p>}
    </div>
  );
};
