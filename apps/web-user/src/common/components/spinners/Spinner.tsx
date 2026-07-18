/**
 * 공통 로딩 스피너
 * - 버튼/오버레이 등에서 서버 응답 대기 표시에 사용
 * - color는 className으로 제어 (예: 기본 버튼 위에서는 text-white)
 */
export function Spinner({
  size = 20,
  className = "text-white",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`animate-spin ${className}`}
      role="status"
      aria-label="로딩 중"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
