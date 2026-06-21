"use client";

import React from "react";
import Image from "next/image";

export interface SliderImage {
  id: string;
  url: string;
}

interface ImageSliderProps {
  /** 이미지 배열 */
  images: SliderImage[];
  /** 이미지 너비 (px) */
  imageWidth?: number;
  /** 이미지 높이 (px) */
  imageHeight?: number;
  /** 이미지 사이 간격 (px) */
  gap?: number;
  /** 이미지 클릭 핸들러 */
  onImageClick?: (image: SliderImage, index: number) => void;
  /** 컨테이너 className */
  className?: string;
  /** 상위 패딩을 무시하고 디바이스 끝까지 스크롤 (px) */
  edgeToEdge?: number;
}

/**
 * 공통 이미지 슬라이더 컴포넌트
 *
 * @example
 * <ImageSlider
 *   images={[{ id: "1", url: "https://..." }]}
 *   imageWidth={80}
 *   imageHeight={80}
 *   onImageClick={(image) => console.log(image.id)}
 * />
 */
export const ImageSlider: React.FC<ImageSliderProps> = ({
  images,
  imageWidth = 80,
  imageHeight = 80,
  gap = 8,
  onImageClick,
  className = "",
  edgeToEdge,
}) => {
  if (!images || images.length === 0) {
    return null;
  }

  const edgeStyle = edgeToEdge
    ? {
        marginLeft: `-${edgeToEdge}px`,
        marginRight: `-${edgeToEdge}px`,
        paddingLeft: `${edgeToEdge}px`,
        paddingRight: `${edgeToEdge}px`,
      }
    : {};

  return (
    <div
      className={`flex overflow-x-auto scrollbar-hide ${className}`}
      style={{ gap: `${gap}px`, ...edgeStyle }}
    >
      {images.map((image, index) => (
        <button
          key={image.id}
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onImageClick?.(image, index);
          }}
          className="flex-shrink-0 rounded-xl overflow-hidden"
          style={{ width: imageWidth, height: imageHeight }}
        >
          <Image
            src={image.url}
            alt={`이미지 ${index + 1}`}
            width={imageWidth}
            height={imageHeight}
            className="w-full h-full object-cover"
          />
        </button>
      ))}
    </div>
  );
};
