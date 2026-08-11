"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { Product } from "@/apps/web-user/features/product/types/product.type";
import { useCreateOrGetChatRoom } from "@/apps/web-user/features/chat/hooks/queries/useChat";
import { PATHS } from "@/apps/web-user/common/constants/paths.constant";
import {
  getProductDiscountRate,
  isProductOnSale,
} from "@/apps/web-user/features/product/utils/product-price.util";

interface ProductDetailInfoSectionProps {
  product: Product;
}

export function ProductDetailInfoSection({ product }: ProductDetailInfoSectionProps) {
  const router = useRouter();
  const createOrGetChatRoom = useCreateOrGetChatRoom();
  const onSale = isProductOnSale(product.originalPrice, product.salePrice);
  const discountRate = getProductDiscountRate(product.originalPrice, product.salePrice);

  const handleStoreClick = () => {
    router.push(PATHS.STORE.DETAIL(product.storeId));
  };

  return (
    <div className="flex flex-col gap-6 px-[20px] pt-[16px] pb-[34px]">
      <div>
        {/* 판매자명, 상품명, 가격 */}
        <button
          onClick={handleStoreClick}
          className="inline-flex items-center gap-[4px] mb-[8px] px-[6px] py-[6px] rounded-full bg-[#F6F5F5] text-xs text-gray-900 font-bold hover:bg-[#E8E6E6] transition-colors cursor-pointer"
        >
          {product.storeLogoImageUrl ? (
            <Image
              src={product.storeLogoImageUrl}
              alt={product.storeName}
              width={14}
              height={14}
              unoptimized
              className="w-[14px] h-[14px] rounded-full object-cover"
            />
          ) : (
            <span className="w-[14px] h-[14px] rounded-full bg-primary" />
          )}
          {product.storeName}
        </button>
        {product.requiresQuote && (
          <span className="mb-[8px] inline-flex items-center gap-[4px] rounded-md bg-[#FDF3E3] px-[8px] py-[4px] text-xs font-bold text-[#AB6E1E]">
            🎨 상담 후 가격 결정
          </span>
        )}
        <h1 className="text-xl font-bold text-gray-900">{product.name}</h1>
        <div className="flex flex-col">
          {product.requiresQuote ? (
            // 가격을 미리 정할 수 없는 상품이라 시작가를 노출하지 않는다
            <p className="text-base font-bold text-gray-900">가격은 상담 후 안내드려요</p>
          ) : (
            <>
              {onSale && (
                <span className="text-xs text-gray-500 line-through">
                  {product.originalPrice.toLocaleString()}원
                </span>
              )}
              <p className="flex items-center gap-[4px] text-xl font-bold text-gray-900">
                {discountRate != null && <span className="text-[#FF653E]">{discountRate}%</span>}
                {product.salePrice.toLocaleString()}원~
              </p>
            </>
          )}
        </div>
      </div>

      {/* 문의하기 — 상품 컨텍스트를 담아 채팅방으로 이동 */}
      <button
        type="button"
        onClick={() =>
          createOrGetChatRoom.mutate({ storeId: product.storeId, productId: product.id })
        }
        disabled={createOrGetChatRoom.isPending}
        className="flex w-full items-center justify-center gap-[6px] rounded-lg border border-gray-300 py-[12px] text-sm font-bold text-gray-900 transition-colors hover:bg-[#F6F5F5] disabled:opacity-50"
      >
        <MessageCircle className="h-4 w-4" />
        문의하기
      </button>
    </div>
  );
}
