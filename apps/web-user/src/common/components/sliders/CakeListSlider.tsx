"use client";

import { useRef, useState } from "react";
import { Product } from "@/apps/web-user/features/product/types/product.type";
import { CakeListItem } from "@/apps/web-user/features/product/components/cards/CakeListItem";
import { Skeleton, SkeletonText } from "@/apps/web-user/common/components/skeleton";
import { EmptyState } from "@/apps/web-user/common/components/fallbacks/EmptyState";

interface CakeListSliderProps {
  title: string;
  products: Product[];
  isLoading: boolean;
  onProductClick: (productId: string) => void;
}

export default function CakeListSlider({
  title,
  products,
  isLoading,
  onProductClick,
}: CakeListSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ isDown: false, hasDragged: false, startX: 0, scrollLeft: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    drag.current.isDown = true;
    drag.current.hasDragged = false;
    drag.current.startX = e.pageX - (scrollRef.current?.offsetLeft ?? 0);
    drag.current.scrollLeft = scrollRef.current?.scrollLeft ?? 0;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!drag.current.isDown) return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current?.offsetLeft ?? 0);
    const walk = x - drag.current.startX;
    if (Math.abs(walk) > 5) drag.current.hasDragged = true;
    if (scrollRef.current) scrollRef.current.scrollLeft = drag.current.scrollLeft - walk;
  };

  const handleMouseUp = () => {
    drag.current.isDown = false;
    setIsDragging(false);
  };

  const handleCardClick = (productId: string) => {
    if (drag.current.hasDragged) return;
    onProductClick(productId);
  };

  return (
    <div className="pb-9">
      <h2 className="px-[20px] py-[10px] text-xl font-bold text-gray-900 mb-6">{title}</h2>
      {isLoading ? (
        <div className="flex gap-[8px] overflow-hidden pl-[20px]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="min-w-[140px]">
              <Skeleton className="w-[140px] h-[140px] rounded-xl" />
              <div className="mt-2 space-y-1.5">
                <SkeletonText className="w-16" />
                <SkeletonText className="w-24" />
                <SkeletonText className="w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState message="등록된 상품이 없습니다." />
      ) : (
        <div
          ref={scrollRef}
          className={`flex gap-[8px] overflow-x-auto scrollbar-hide pl-[20px] select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {products.map((product) => (
            <CakeListItem key={product.id} product={product} onCardClick={handleCardClick} />
          ))}
          <div className="min-w-[12px] shrink-0" />
        </div>
      )}
    </div>
  );
}
