"use client";

import { useEffect, useRef, useState } from "react";
import { Review } from "@/apps/web-user/features/review/types/review.type";
import { ImageSlider } from "@/apps/web-user/common/components/sliders";
import { Icon } from "@/apps/web-user/common/components/icons";
import Image from "next/image";

interface ReviewItemProps {
  review: Review;
  onImageClick?: (review: Review) => void;
}

export function ReviewItem({ review, onImageClick }: ReviewItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [isOptionExpanded, setIsOptionExpanded] = useState(false);
  const contentRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = contentRef.current;
    if (el) {
      setIsTruncated(el.scrollHeight > el.clientHeight);
    }
  }, [review.content]);

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  };

  const renderRating = (rating: number) => {
    const roundedRating = Math.round(rating);
    return (
      <span className="flex items-center gap-[2px]">
        <Icon name="star" width={18} height={18} className="text-yellow-400" />
        <span className="font-bold text-gray-900">{roundedRating}</span>
      </span>
    );
  };

  return (
    <div className="mx-[-20px] mb-[20px] px-[20px] pt-[20px] pb-[48px] border-b border-gray-100 last:border-b-0">
      <div className="flex items-center justify-between mb-[12px]">
        <span className="text-sm font-medium text-gray-900">{renderRating(review.rating)}</span>
        <div className="flex items-center gap-[24px] text-gray-500">
          <span className="relative text-sm before:content-[''] before:absolute before:right-[-12px] before:top-1/2 before:-translate-y-1/2 before:w-[1px] before:h-[8px] before:bg-gray-300">
            {formatDate(review.createdAt)}
          </span>
          <span className="text-sm">{review.userNickname || "익명"}</span>
        </div>
      </div>

      <div>
        <p
          ref={contentRef}
          className={`text-sm text-gray-700 leading-[140%] ${!isExpanded ? "line-clamp-3" : ""}`}
        >
          {review.content}
        </p>
        {isTruncated && !isExpanded && (
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="text-sm text-gray-500 mt-[4px]"
          >
            더보기
          </button>
        )}
        {isExpanded && (
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="text-sm text-gray-500 mt-[4px]"
          >
            접기
          </button>
        )}
      </div>

      <div className="relative mt-[12px] py-[12px] px-[16px] bg-gray-50 rounded-xl">
        <div className="flex items-center gap-[12px] pr-[70px]">
          <span className="w-[40px] h-[40px] relative rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src="/images/contents/review_test.webp"
              alt="test review image"
              width={40}
              height={40}
            />
          </span>
          <div className="flex flex-col text-sm text-gray-900">
            <p>해피퍼피 생일케이크</p>
            <p>35,000원</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsOptionExpanded(!isOptionExpanded)}
          className="absolute right-[16px] top-[12px] flex items-center gap-[2px] text-sm text-gray-500"
        >
          주문옵션{" "}
          <Icon
            name="arrow"
            width={16}
            height={16}
            className={`text-gray-500 transition-transform ${isOptionExpanded ? "rotate-0" : "rotate-180"}`}
          />
        </button>
        {isOptionExpanded && (
          <p className="text-2sm text-gray-500 mt-[12px]">
            1호(+1000원) / 바닐라시트(+1000원) / 라즈베리 크림(+1000원)
          </p>
        )}
      </div>

      {/* 리뷰 이미지 */}
      {review.imageUrls.length > 0 && onImageClick && (
        <div className="mt-[12px]">
          <ImageSlider
            images={review.imageUrls.map((url, idx) => ({
              id: `${review.id}-${idx}`,
              url,
            }))}
            imageWidth={160}
            imageHeight={120}
            gap={4}
            onImageClick={() => onImageClick(review)}
          />
        </div>
      )}
    </div>
  );
}
