import clsx from "clsx";
import { ReactNode } from "react";
import { Icon } from "@/apps/web-user/common/components/icons";

interface EmptyStateProps {
  /** 안내 문구 */
  message: string;
  /** 컨테이너 클래스 오버라이드 (높이/패딩 등). 미지정 시 기본 py-10 적용 */
  className?: string;
  /** 문구 하단에 붙일 추가 요소 (버튼 등) */
  children?: ReactNode;
}

/**
 * 데이터가 없는 경우(빈 상태)를 표현하는 공용 컴포넌트.
 * 예약 내역 없음, 검색 결과 없음, 등록된 상품 없음 등 모든 no-data 상황에서 사용한다.
 * UI는 지도 스토어 목록(MapStoreListSection)의 빈 상태 디자인과 동일하다.
 */
export function EmptyState({ message, className, children }: EmptyStateProps) {
  return (
    <div
      className={clsx("flex flex-col items-center justify-center", className ?? "py-10")}
      style={{ gap: 20 }}
    >
      <Icon name="noData" width={62} height={57} className="shrink-0" />
      <span
        style={{
          fontWeight: 400,
          fontSize: 14,
          lineHeight: "140%",
          color: "var(--grayscale-gr-700, #6B6B6A)",
        }}
      >
        {message}
      </span>
      {children}
    </div>
  );
}
