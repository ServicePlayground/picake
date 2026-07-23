/**
 * 비활성화(disabled) 상태 공통 스타일.
 *
 * 네이티브 `disabled` 속성이 있을 때 자동으로 적용되는 `disabled:` variant 모음입니다.
 * 버튼 종류(default / orange / red)에 맞는 값을 골라 className에 붙여서 사용하세요.
 *
 * @example
 * import { cn } from "@/apps/web-user/common/lib/utils";
 * import { disabledStyle } from "@/apps/web-user/common/styles/disabled.style";
 *
 * <button disabled={...} className={cn("...기본 스타일...", disabledStyle.default)} />
 */
export const disabledStyle = {
  /** 1. default: border gray-100 / text gray-200 / bg gray-50 */
  default:
    "disabled:border-gray-100 disabled:text-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed",
  /** 2. orange: border none / text gray-300 / bg gray-200 */
  orange:
    "disabled:border-none disabled:text-gray-300 disabled:bg-gray-200 disabled:cursor-not-allowed",
  /** 3. red: border none / text gray-300 / bg gray-200 */
  red: "disabled:border-none disabled:text-gray-300 disabled:bg-gray-200 disabled:cursor-not-allowed",
} as const;
