"use client";

import { use } from "react";
import { useStoreDetail } from "@/apps/web-user/features/store/hooks/queries/useStoreDetail";
import { useProductList } from "@/apps/web-user/features/product/hooks/queries/useProductList";
import { useStoreFeeds } from "@/apps/web-user/features/feed/hooks/queries/useStoreFeeds";
import { StoreDetailIntroSection } from "@/apps/web-user/features/store/components/sections/StoreDetailIntroSection";
import { StoreDetailProductListSection } from "@/apps/web-user/features/store/components/sections/StoreDetailProductListSection";
import { StoreDetailReviewSection } from "@/apps/web-user/features/store/components/sections/StoreDetailReviewSection";
import { StoreDetailFeedSection } from "@/apps/web-user/features/store/components/sections/StoreDetailFeedSection";
import { Tabs } from "@/apps/web-user/common/components/tabs/Tabs";
import { StoreDetailSkeleton } from "@/apps/web-user/common/components/skeleton/StoreDetailSkeleton";

interface StoreDetailPageProps {
  params: Promise<{ storeId: string }>;
}

export default function StoreDetailPage({ params }: StoreDetailPageProps) {
  const { storeId } = use(params);
  const { data, isLoading } = useStoreDetail(storeId);
  const { data: productData } = useProductList({ storeId });
  // StoreDetailFeedSection과 동일한 파라미터 → 쿼리 캐시 공유 (추가 요청 없음)
  const { data: feedData } = useStoreFeeds({ storeId });

  // 상품 개수 (첫 페이지 meta에서 가져옴)
  const productCount = productData?.pages[0]?.meta.totalItems ?? 0;
  const feedCount = feedData?.meta.totalItems ?? 0;

  if (isLoading) {
    return <StoreDetailSkeleton />;
  }

  if (!data) {
    return <div>스토어 정보를 불러오지 못했습니다.</div>;
  }

  return (
    <div className="w-full">
      <div className="px-[20px]">
        <StoreDetailIntroSection store={data} />
      </div>
      <Tabs
        defaultTab="product"
        swipeable
        tabs={[
          {
            id: "product",
            label: `상품 ${productCount}`,
            content: <StoreDetailProductListSection storeId={storeId} />,
          },
          {
            id: "review",
            label: `후기 ${data.totalReviewCount}`,
            content: <StoreDetailReviewSection storeId={storeId} />,
          },
          {
            id: "feed",
            label: `피드 ${feedCount}`,
            content: <StoreDetailFeedSection storeId={storeId} />,
          },
        ]}
      />
    </div>
  );
}
