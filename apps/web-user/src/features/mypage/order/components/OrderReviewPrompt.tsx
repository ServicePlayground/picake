import Link from "next/link";
import Image from "next/image";
import { PATHS } from "@/apps/web-user/common/constants/paths.constant";
import {
  OrderResponse,
  OrderMyReviewUiStatus,
} from "@/apps/web-user/features/order/types/order.type";

interface OrderReviewPromptProps {
  order: OrderResponse;
}

/**
 * 주문 후기 영역
 * - WRITABLE: "맛있게 드셨나요? 후기를 남겨주세요" + 별 5개 (클릭 시 후기 작성 페이지 이동)
 * - WRITTEN: "작성후기보기" 버튼 (클릭 시 후기 상세 이동)
 * - NOT_AVAILABLE / WITHDRAWN: 표시 안 함
 */
export function OrderReviewPrompt({ order }: OrderReviewPromptProps) {
  if (order.myReviewUiStatus === OrderMyReviewUiStatus.WRITABLE) {
    return (
      <Link
        href={PATHS.REVIEW_WRITE(order.id)}
        className="flex flex-col items-center gap-3 -mx-4 py-5 px-4 border-t border-gray-100 mt-3"
      >
        <p className="text-xs font-bold text-gray-900">맛있게 드셨나요? 후기를 남겨주세요</p>
        <div className="flex gap-[18px]">
          {[1, 2, 3, 4, 5].map((i) => (
            <Image key={i} src="/images/contents/star_none.png" alt="별" width={32} height={32} />
          ))}
        </div>
      </Link>
    );
  }

  if (order.myReviewUiStatus === OrderMyReviewUiStatus.WRITTEN) {
    return (
      <Link
        href={`/mypage/reviews#review-${order.linkedProductReviewId}`}
        className="flex items-center justify-center mt-[18px] h-[40px] rounded-lg border border-gray-100 text-sm font-bold text-gray-900 bg-white"
      >
        작성 후기 보기
      </Link>
    );
  }

  return null;
}
