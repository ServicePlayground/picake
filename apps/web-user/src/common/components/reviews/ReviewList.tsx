"use client";

import { useState } from "react";
import { Review, ReviewSortBy } from "@/apps/web-user/features/review/types/review.type";
import { ReviewItem } from "./ReviewItem";
import { ReviewDetailModal } from "@/apps/web-user/features/product/components/modals/ReviewDetailModal";

interface ReviewListProps {
  reviews: Review[];
  totalCount?: number;
  sortBy: ReviewSortBy;
  onSortChange: (sortBy: ReviewSortBy) => void;
  title?: string;
  emptyMessage?: string;
}

export function ReviewList({
  reviews,
  totalCount,
  sortBy,
  onSortChange,
  title = "후기",
  emptyMessage = "등록된 후기가 없습니다.",
}: ReviewListProps) {
  const [isReviewDetailModalOpen, setIsReviewDetailModalOpen] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<string | undefined>(undefined);
  const [modalReviews, setModalReviews] = useState<Review[]>([]);

  const displayCount = totalCount ?? reviews.length;

  const handleReviewImageClick = (review: Review) => {
    setSelectedReviewId(review.id);
    setModalReviews([review]);
    setIsReviewDetailModalOpen(true);
  };

  return (
    <div>
      {/* 헤더: 타이틀 + 정렬 버튼 */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">
          {title} {displayCount}
        </h3>
        <div className="flex gap-[8px]">
          <button
            type="button"
            onClick={() => onSortChange(ReviewSortBy.LATEST)}
            className={`px-[4px] py-[2px] text-sm ${sortBy === ReviewSortBy.LATEST ? "text-gray-900 font-bold" : "text-gray-300"}`}
          >
            최신순
          </button>
          <button
            type="button"
            onClick={() => onSortChange(ReviewSortBy.RATING_DESC)}
            className={`px-[4px] py-[2px] text-sm ${sortBy === ReviewSortBy.RATING_DESC ? "text-gray-900 font-bold" : "text-gray-300"}`}
          >
            별점순
          </button>
        </div>
      </div>

      {/* 리뷰 리스트 */}
      <div className="mt-3">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <ReviewItem key={review.id} review={review} onImageClick={handleReviewImageClick} />
          ))
        ) : (
          <p className="text-sm text-gray-500 py-4 text-center">{emptyMessage}</p>
        )}
      </div>

      {/* 후기 상세 모달 */}
      <ReviewDetailModal
        isOpen={isReviewDetailModalOpen}
        onClose={() => setIsReviewDetailModalOpen(false)}
        reviews={modalReviews}
        initialReviewId={selectedReviewId}
      />
    </div>
  );
}
