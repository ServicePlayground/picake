"use client";

import { use, useState, useEffect } from "react";
import { useProductDetail } from "@/apps/web-user/features/product/hooks/queries/useProductDetail";
import { useProductReviews } from "@/apps/web-user/features/review/hooks/queries/useProductReviews";
import { useAddProductLike } from "@/apps/web-user/features/like/hooks/mutations/useAddProductLike";
import { useRemoveProductLike } from "@/apps/web-user/features/like/hooks/mutations/useRemoveProductLike";
import { ProductDetailImageGallerySection } from "@/apps/web-user/features/product/components/sections/ProductDetailImageGallerySection";
import { ProductDetailInfoSection } from "@/apps/web-user/features/product/components/sections/ProductDetailInfoSection";
import { ProductDetailDescriptionSection } from "@/apps/web-user/features/product/components/sections/ProductDetailDescriptionSection";
import { ProductDetailInformationNoticeSection } from "@/apps/web-user/features/product/components/sections/ProductDetailInformationNoticeSection";
import { ProductDetailReviewSection } from "@/apps/web-user/features/product/components/sections/ProductDetailReviewSection";
import { Tabs } from "@/apps/web-user/common/components/tabs/Tabs";
import { ProductDetailSizeFlavorSection } from "@/apps/web-user/features/product/components/sections/ProductDetailSizeFlavorSection";
import { Icon } from "@/apps/web-user/common/components/icons";
import { Button } from "@/apps/web-user/common/components/buttons/Button";
import { ReservationBottomSheet } from "@/apps/web-user/features/product/components/sections/reservation-bottom-sheet";
import { ProductType } from "@/apps/web-user/features/product/types/product.type";
import { ProductDetailSkeleton } from "@/apps/web-user/common/components/skeleton/ProductDetailSkeleton";
import { useStoreDetail } from "@/apps/web-user/features/store/hooks/queries/useStoreDetail";
import { useAuthStore } from "@/apps/web-user/common/store/auth.store";
import { useLoginSheetStore } from "@/apps/web-user/common/store/login-sheet.store";

interface ProductDetailPageProps {
  params: Promise<{ productId: string }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { productId } = use(params);
  const { data, isLoading } = useProductDetail(productId);
  const { data: reviewData } = useProductReviews({ productId });
  const { mutate: addLike, isPending: isAddingLike } = useAddProductLike();
  const { mutate: removeLike, isPending: isRemovingLike } = useRemoveProductLike();
  // 예약 바텀시트 캘린더에서 휴무일 disable + 영업시간 노출용 영업 캘린더
  const { data: storeDetail } = useStoreDetail(data?.storeId ?? "");

  const [isLiked, setIsLiked] = useState(false);
  const isLikeLoading = isAddingLike || isRemovingLike;

  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const openLoginSheet = useLoginSheetStore((s) => s.openLoginSheet);

  const handleReservationClick = () => {
    if (!isAuthenticated) {
      openLoginSheet();
      return;
    }
    setIsBottomSheetOpen(true);
  };

  // 서버에서 isLiked 값이 변경되면 로컬 상태 동기화
  useEffect(() => {
    if (data?.isLiked !== undefined && data?.isLiked !== null) {
      setIsLiked(data.isLiked);
    }
  }, [data?.isLiked]);

  const handleLikeToggle = () => {
    if (!isAuthenticated) {
      openLoginSheet();
      return;
    }
    if (isLikeLoading) return;

    // 낙관적 업데이트
    setIsLiked(!isLiked);

    if (isLiked) {
      removeLike(productId, {
        onError: () => setIsLiked(true),
      });
    } else {
      addLike(productId, {
        onError: () => setIsLiked(false),
      });
    }
  };

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (!data) {
    return (
      <div className="w-full mx-auto px-5 py-6 text-center text-gray-500">
        상품 정보를 불러오지 못했습니다.
      </div>
    );
  }

  return (
    <div className="pb-[100px]">
      {/* 이미지 갤러리 */}
      <ProductDetailImageGallerySection images={data.images} productName={data.name} />
      {/* 상품 정보 */}
      <ProductDetailInfoSection product={data} />

      {/* 탭 영역 */}
      <Tabs
        defaultTab="detail"
        tabs={[
          {
            id: "detail",
            label: "상세정보",
            content: <ProductDetailDescriptionSection detailDescription={data.detailDescription} />,
          },
          {
            id: "size-flavor",
            label: "사이즈·맛",
            content: (
              <ProductDetailSizeFlavorSection
                cakeSizeOptions={data.cakeSizeOptions}
                cakeFlavorOptions={data.cakeFlavorOptions}
              />
            ),
          },
          {
            id: "review",
            label: `후기 ${reviewData?.meta.totalItems ?? 0}`,
            content: <ProductDetailReviewSection productId={productId} />,
          },
          {
            id: "notice",
            label: "이용안내",
            content: (
              <ProductDetailInformationNoticeSection
                product={data}
                cancellationRefundDetailDescription="취소 및 환불규정의 내용이 들어갑니다."
              />
            ),
          },
        ]}
      />

      {/* 예약하기, 좋아요 - 하단 고정 */}
      <div className="fixed bottom-0 left-0 right-0 mx-auto max-w-[638px] bg-white border-gray-200 flex flex-col shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.16)]">
        <div className="flex items-center gap-[16px] px-[20px] py-[10px]">
          <button
            type="button"
            onClick={handleLikeToggle}
            disabled={isLikeLoading}
            className={`flex flex-col items-center justify-center w-[40px] h-[40px] ${isLikeLoading ? "opacity-50" : ""}`}
          >
            <Icon
              name={isLiked ? "favoriteFilled" : "favorite"}
              width={24}
              height={24}
              className={isLiked ? "text-primary" : "text-gray-500"}
            />
            <span className="text-xs text-gray-900 font-bold">{data.likeCount}</span>
          </button>
          <span className="flex-1">
            <Button onClick={handleReservationClick}>
              {data.productType === ProductType.BASIC_CAKE ? "예약하기" : "예약신청"}
            </Button>
          </span>
        </div>
      </div>

      {/* 예약 바텀시트 */}
      <ReservationBottomSheet
        isOpen={isBottomSheetOpen}
        productId={productId}
        price={data.salePrice}
        cakeTitle={data.name}
        cakeImageUrl={data.images[0] ?? ""}
        cakeImages={data.images}
        cakeSizeOptions={data.cakeSizeOptions}
        cakeFlavorOptions={data.cakeFlavorOptions}
        productType={data.productType}
        productNoticeProducer={data.productNoticeProducer}
        productNoticeAddress={data.productNoticeAddress}
        storeName={data.storeName}
        pickupAddress={data.pickupAddress}
        pickupRoadAddress={data.pickupRoadAddress}
        pickupDetailAddress={data.pickupDetailAddress}
        pickupZonecode={data.pickupZonecode}
        pickupLatitude={data.pickupLatitude}
        pickupLongitude={data.pickupLongitude}
        imageUploadEnabled={data.imageUploadEnabled}
        letteringMaxLength={data.letteringMaxLength}
        businessCalendar={storeDetail?.businessCalendar}
        refundCancellationPolicy={data.storeRefundCancellationPolicy}
        onClose={() => setIsBottomSheetOpen(false)}
      />

    </div>
  );
}
