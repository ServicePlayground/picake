"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import {
  TransformWrapper,
  TransformComponent,
  ReactZoomPanPinchContentRef,
} from "react-zoom-pan-pinch";
import { Icon } from "@/apps/web-user/common/components/icons";
import { SliderImage } from "./ImageSlider";

interface ImageModalProps {
  /** 모달 열림 상태 */
  isOpen: boolean;
  /** 모달 닫기 핸들러 */
  onClose: () => void;
  /** 이미지 배열 */
  images: SliderImage[];
  /** 초기 선택된 이미지 인덱스 */
  initialIndex?: number;
}

/**
 * 이미지 상세 보기 모달 컴포넌트
 */
export const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
}) => {
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const transformRefs = useRef<(ReactZoomPanPinchContentRef | null)[]>([]);

  useEffect(() => {
    if (isOpen && swiper) {
      swiper.slideTo(initialIndex, 0);
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex, swiper]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        swiper?.slidePrev();
      } else if (e.key === "ArrowRight") {
        swiper?.slideNext();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, swiper]);

  if (!isOpen || images.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
      {/* 닫기 버튼 */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 text-white"
      >
        <Icon name="close" width={24} height={24} />
      </button>

      {/* 이미지 카운터 */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 text-white text-sm">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Swiper 슬라이더 */}
      <div className="w-full h-full">
        <Swiper
          modules={[Navigation]}
          onSwiper={setSwiper}
          onSlideChange={(s) => {
            // 이전 슬라이드 줌 리셋
            transformRefs.current.forEach((ref) => {
              ref?.resetTransform();
            });
            // 스와이프 다시 활성화
            s.allowTouchMove = true;
            setCurrentIndex(s.activeIndex);
          }}
          slidesPerView={1}
          initialSlide={initialIndex}
          className="w-full h-full"
        >
          {images.map((image, idx) => (
            <SwiperSlide key={image.id} className="flex items-center justify-center">
              <TransformWrapper
                ref={(ref) => {
                  transformRefs.current[idx] = ref;
                }}
                initialScale={1}
                minScale={1}
                maxScale={4}
                centerOnInit
                doubleClick={{ mode: "reset" }}
                panning={{ disabled: false }}
                onPanningStart={(ref) => {
                  // 줌 상태가 아닐 때는 스와이프 허용
                  if (ref.state.scale === 1) {
                    swiper && (swiper.allowTouchMove = true);
                  }
                }}
                onZoom={(ref) => {
                  // 줌 중일 때는 스와이프 비활성화
                  if (ref.state.scale > 1) {
                    swiper && (swiper.allowTouchMove = false);
                  } else {
                    swiper && (swiper.allowTouchMove = true);
                  }
                }}
              >
                <TransformComponent
                  wrapperStyle={{ width: "100%", height: "100%" }}
                  contentStyle={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div className="relative w-full h-full flex items-center justify-center p-4">
                    <Image
                      src={image.url}
                      alt={`이미지 ${idx + 1}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                </TransformComponent>
              </TransformWrapper>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* 좌우 컨트롤러 */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => swiper?.slidePrev()}
            className={`absolute left-4 z-10 p-2 text-white ${
              currentIndex === 0 ? "opacity-30" : ""
            }`}
            disabled={currentIndex === 0}
          >
            <Icon name="chevronLeft" width={32} height={32} />
          </button>
          <button
            type="button"
            onClick={() => swiper?.slideNext()}
            className={`absolute right-4 z-10 p-2 text-white ${
              currentIndex === images.length - 1 ? "opacity-30" : ""
            }`}
            disabled={currentIndex === images.length - 1}
          >
            <Icon name="chevronLeft" width={32} height={32} className="rotate-180" />
          </button>
        </>
      )}
    </div>
  );
};
