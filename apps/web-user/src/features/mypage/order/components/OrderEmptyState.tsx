import clsx from "clsx";
import Image from "next/image";

interface OrderEmptyStateProps {
  message?: string;
  /** 컨테이너 높이 클래스 등을 덮어쓸 때 사용 (미지정 시 기본 min-h 적용) */
  className?: string;
}

export function OrderEmptyState({
  message = "예약 내역이 없어요",
  className,
}: OrderEmptyStateProps) {
  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center gap-5 text-sm text-gray-700",
        className ?? "min-h-[calc(100vh-200px)]",
      )}
    >
      <Image src="/images/contents/none_items.png" alt={message} width={62} height={57} />
      <p className="text-sm text-gray-700">{message}</p>
    </div>
  );
}
