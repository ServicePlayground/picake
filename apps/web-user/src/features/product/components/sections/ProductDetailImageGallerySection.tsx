"use client";

import { useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Thumbs } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

interface ProductDetailImageGallerySectionProps {
  images: string[];
  productName: string;
}

export function ProductDetailImageGallerySection({
  images,
  productName,
}: ProductDetailImageGallerySectionProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-square bg-gray-100 flex items-center justify-center text-gray-500 text-sm font-medium">
        이미지가 없습니다.
      </div>
    );
  }

  return (
    <div className="product-image-gallery">
      {/* 메인 슬라이드 */}
      <Swiper
        modules={[Pagination, Thumbs]}
        pagination={{ type: "fraction" }}
        thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
        loop={images.length > 1}
        className="w-full aspect-square"
      >
        {images.map((image, index) => (
          <SwiperSlide key={index}>
            <div className="w-full h-full relative">
              <Image
                src={image}
                alt={`${productName} - 이미지 ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
                unoptimized
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* 썸네일 미리보기 (이미지가 2개 이상일 때만 표시) */}
      {images.length > 1 && (
        <Swiper
          onSwiper={setThumbsSwiper}
          modules={[Thumbs]}
          watchSlidesProgress
          slidesPerView="auto"
          spaceBetween={6}
          className="mt-[8px] !px-[8px] thumbnail-swiper [&_.swiper-slide-thumb-active>div]:outline-none [&_.swiper-slide-thumb-active>div]:after:bg-white/30 [&_.swiper-slide-thumb-active>div]:after:border-2 [&_.swiper-slide-thumb-active>div]:after:border-primary [&_.swiper-slide-thumb-active>div]:after:rounded-xl"
        >
          {images.map((image, index) => (
            <SwiperSlide key={index} className="!w-[60px] cursor-pointer">
              <div className="w-[60px] h-[60px] relative rounded-xl overflow-hidden after:absolute after:inset-0 after:z-10 after:pointer-events-none">
                <Image
                  src={image}
                  alt={`${productName} - 썸네일 ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
}
