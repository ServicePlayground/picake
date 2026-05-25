"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { SearchBar } from "@/apps/web-user/common/components/search/SearchBar";
import BannerSlider from "@/apps/web-user/features/home-banner/components/BannerSlider";
import CakeListSlider from "@/apps/web-user/common/components/sliders/CakeListSlider";
import CategoryList from "@/apps/web-user/common/components/categories/CategoryList";
import { useProductList } from "@/apps/web-user/features/product/hooks/queries/useProductList";
import { SortBy, Product } from "@/apps/web-user/features/product/types/product.type";
import { PATHS } from "@/apps/web-user/common/constants/paths.constant";
import { useHeaderStore } from "@/apps/web-user/common/store/header.store";
import { BottomNav } from "@/apps/web-user/common/components/navigation/BottomNav";
import { useUserCurrentLocationStore } from "@/apps/web-user/common/store/user-current-location.store";
import { useStoreRegions } from "@/apps/web-user/features/store/hooks/queries/useStoreRegions";
import { buildRegionsParam } from "@/apps/web-user/common/utils/region-match.util";

export default function Home() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const searchBarRef = useRef<HTMLDivElement>(null);
  const { setIsHomeSearchVisible } = useHeaderStore();
  const { selectedRegion } = useUserCurrentLocationStore();
  const { data: regionsData } = useStoreRegions();

  const regions = useMemo(() => {
    if (!selectedRegion || !regionsData?.regions) return undefined;
    return buildRegionsParam(selectedRegion, regionsData.regions) || undefined;
  }, [selectedRegion, regionsData]);

  const { data: latestData, isLoading: isLatestLoading } = useProductList({
    sortBy: SortBy.LATEST,
    limit: 10,
    regions,
  });

  const { data: popularData, isLoading: isPopularLoading } = useProductList({
    sortBy: SortBy.POPULAR,
    limit: 10,
    regions,
  });

  useEffect(() => {
    const el = searchBarRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsHomeSearchVisible(entry.isIntersecting),
      { rootMargin: "-52px 0px 0px 0px", threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [setIsHomeSearchVisible]);

  // 페이지 벗어날 때 초기화
  useEffect(() => {
    return () => setIsHomeSearchVisible(true);
  }, [setIsHomeSearchVisible]);

  const handleSearch = (searchValue: string) => {
    if (searchValue.trim()) {
      router.push(`${PATHS.SEARCH}?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  const latestProducts: Product[] = latestData?.pages?.[0]?.data?.slice(0, 10) || [];
  const popularProducts: Product[] = popularData?.pages?.[0]?.data?.slice(0, 10) || [];

  const handleProductClick = (productId: string) => {
    router.push(PATHS.PRODUCT.DETAIL(productId));
  };

  return (
    <div className="w-full pb-[110px]">
      {/* 배너 */}
      <BannerSlider />
      {/* 검색 바 */}
      <div className="w-full relative -mt-[30px] pt-[20px] pb-[56px] px-[24px] z-10 rounded-t-4xl bg-white bg-[url('/images/contents/category_bg.png')] bg-top bg-no-repeat">
        <div ref={searchBarRef} className="w-full mb-[20px]">
          <SearchBar
            placeholder="상품을 검색해보세요"
            initialValue={searchTerm}
            onSearch={handleSearch}
            onChange={setSearchTerm}
          />
        </div>
        {/* 카테고리 */}
        <CategoryList />
      </div>

      {/* 신규케이크 (최신순) */}
      <CakeListSlider
        title="신규케이크"
        products={latestProducts}
        isLoading={isLatestLoading}
        onProductClick={handleProductClick}
      />

      {/* 인기케이크 (인기순) */}
      <CakeListSlider
        title="인기케이크"
        products={popularProducts}
        isLoading={isPopularLoading}
        onProductClick={handleProductClick}
      />
      <BottomNav />
    </div>
  );
}
