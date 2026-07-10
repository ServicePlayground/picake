"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Review, ReviewSortBy } from "@/apps/web-user/features/review/types/review.type";
import { useProductReviews } from "@/apps/web-user/features/review/hooks/queries/useProductReviews";
import { ProductDetailSubTitle } from "../common/ProductDetailSubTitle";
import { SliderImage } from "@/apps/web-user/common/components/sliders";
import { ReviewList } from "@/apps/web-user/common/components/reviews";
import { ReviewDetailModal } from "../modals/ReviewDetailModal.dynamic";
import { PhotoReviewListModal } from "../modals/PhotoReviewListModal";

interface ReviewImage extends SliderImage {
  reviewId: string;
}

interface ProductDetailReviewSectionProps {
  productId: string;
}

export function ProductDetailReviewSection({ productId }: ProductDetailReviewSectionProps) {
  const [sortBy, setSortBy] = useState<ReviewSortBy>(ReviewSortBy.LATEST);
  const [isReviewDetailModalOpen, setIsReviewDetailModalOpen] = useState(false);
  const [isPhotoListModalOpen, setIsPhotoListModalOpen] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<string | undefined>(undefined);
  const [modalReviews, setModalReviews] = useState<Review[]>([]);

  // 사진 후기용 - 항상 최신순
  const { data: photoReviewData } = useProductReviews({
    productId,
    sortBy: ReviewSortBy.LATEST,
  });

  // 후기 목록용 - 사용자 선택
  const { data: reviewData } = useProductReviews({ productId, sortBy });

  // 사진 후기 이미지 (최신순)
  const allPhotoImages: ReviewImage[] = useMemo(() => {
    if (!photoReviewData?.data) return [];

    return photoReviewData.data.flatMap((review) =>
      review.imageUrls.map((url: string, idx: number) => ({
        id: `${review.id}-${idx}`,
        url,
        reviewId: review.id,
      })),
    );
  }, [photoReviewData]);

  // 이미지가 있는 리뷰만 필터링 (사진 후기용)
  const reviewsWithImages = useMemo(() => {
    return photoReviewData?.data.filter((r) => r.imageUrls.length > 0) ?? [];
  }, [photoReviewData]);

  const handlePhotoClick = (reviewId: string) => {
    setSelectedReviewId(reviewId);
    setModalReviews(reviewsWithImages);
    setIsReviewDetailModalOpen(true);
  };

  const handleViewAllClick = () => {
    setIsPhotoListModalOpen(true);
  };

  const handleSortChange = (newSortBy: ReviewSortBy) => {
    setSortBy(newSortBy);
  };

  return (
    <div>
      {/* 사진 후기 */}
      {allPhotoImages.length >= 10 && (
        <>
          <ProductDetailSubTitle>사진 후기</ProductDetailSubTitle>
          <div
            className="mt-[12px] mb-[33px] flex gap-[4px] overflow-x-auto"
            style={{
              WebkitOverflowScrolling: "touch",
              msOverflowStyle: "none",
              scrollbarWidth: "none",
            }}
          >
            {allPhotoImages.slice(0, 4).map((image, index) => {
              const isLastVisible = index === 3;
              return (
                <button
                  key={image.id}
                  type="button"
                  onClick={
                    isLastVisible ? handleViewAllClick : () => handlePhotoClick(image.reviewId)
                  }
                  className="relative flex-shrink-0 rounded-xl overflow-hidden"
                  style={{ width: 130, height: 130 }}
                >
                  <Image
                    src={image.url}
                    alt={`사진 후기 ${index + 1}`}
                    width={130}
                    height={130}
                    className="w-full h-full object-cover"
                  />
                  {isLastVisible && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">모두보기</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* 후기 목록 */}
      <ReviewList
        reviews={reviewData?.data ?? []}
        totalCount={reviewData?.data?.length}
        sortBy={sortBy}
        onSortChange={handleSortChange}
      />

      {/* 사진 후기 리스트 모달 */}
      <PhotoReviewListModal
        isOpen={isPhotoListModalOpen}
        onClose={() => setIsPhotoListModalOpen(false)}
        images={allPhotoImages}
        onImageClick={handlePhotoClick}
      />

      {/* 사진 후기 상세 모달 */}
      <ReviewDetailModal
        isOpen={isReviewDetailModalOpen}
        onClose={() => setIsReviewDetailModalOpen(false)}
        reviews={modalReviews}
        initialReviewId={selectedReviewId}
      />
    </div>
  );
}
