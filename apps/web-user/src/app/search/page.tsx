"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SearchProductListSection } from "@/apps/web-user/features/product/components/sections/SearchProductListSection";
import { SearchStoreListSection } from "@/apps/web-user/features/store/components/sections/SearchStoreListSection";
import { Icon } from "@/apps/web-user/common/components/icons";
import {
  SearchFilterSheet,
  type SearchSortBy,
} from "@/apps/web-user/features/search/components/SearchFilterSheet";
import type { StoreListFilter } from "@/apps/web-user/features/store/types/store.type";
import { hasActiveFilter } from "@/apps/web-user/features/store/components/map/MapStoreListFilter";
import { releaseSoftKeyboard } from "@/apps/web-user/common/utils/soft-keyboard.util";

const RECENT_SEARCHES_KEY = "recentSearches";
const MAX_RECENT = 10;
/** 필터 시트의 기본 정렬. 이 값과 다르면 정렬을 바꾼 것으로 본다 */
const DEFAULT_SORT_BY: SearchSortBy = "distance";

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRecentSearch(term: string) {
  const prev = getRecentSearches().filter((t) => t !== term);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify([term, ...prev].slice(0, MAX_RECENT)));
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [submittedTerm, setSubmittedTerm] = useState(searchParams.get("q") || "");
  const [activeTab, setActiveTab] = useState<"product" | "store">("product");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [listFilter, setListFilter] = useState<StoreListFilter>({});
  const [sortBy, setSortBy] = useState<SearchSortBy>(DEFAULT_SORT_BY);

  useEffect(() => {
    const q = searchParams.get("q");
    setSearchTerm(q || "");
  }, [searchParams]);

  // 검색어 없이 진입한 경우(홈의 검색 버튼 등)에는 바로 입력할 수 있도록 키보드를 올린다.
  // 홈에서 미리 띄워둔 임시 입력은 실제 입력에 포커스를 넘긴 뒤 정리한다.
  useEffect(() => {
    if (!searchParams.get("q")) {
      inputRef.current?.focus({ preventScroll: true });
    }
    releaseSoftKeyboard();
  }, []);

  const handleSearch = (term: string) => {
    if (!term.trim()) return;
    saveRecentSearch(term.trim());
    setSearchTerm(term.trim());
    setSubmittedTerm(term.trim());
    router.push(`/search?q=${encodeURIComponent(term.trim())}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchTerm);
  };

  const isSearching = !!submittedTerm.trim();
  // 필터 시트에서 조건이나 정렬을 바꾼 상태면 아이콘을 on으로 표시
  const isFilterActive = hasActiveFilter(listFilter) || sortBy !== DEFAULT_SORT_BY;

  return (
    <div className="w-full">
      {/* 검색 입력 */}
      <div className="flex items-center px-5 h-[52px] border-b border-gray-100">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full">
          <Icon name="search" width={20} height={20} className="text-gray-800 shrink-0" />
          <input
            ref={inputRef}
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch(searchTerm)}
            placeholder="어떤 케이크를 찾으시나요?"
            className="flex-1 text-sm text-gray-900 outline-none placeholder:text-gray-500 [&::-webkit-search-cancel-button]:hidden"
          />
          {searchTerm && (
            <button type="button" onClick={() => setSearchTerm("")} className="w-5 h-5">
              <Icon name="closeCircle" width={20} height={20} className="text-gray-300" />
            </button>
          )}
        </form>
      </div>

      {/* 탭 + 검색 결과 */}
      {isSearching && (
        <>
          <div className="flex items-center gap-[24px] py-[16px] px-[20px]">
            <button
              type="button"
              onClick={() => setIsFilterOpen(true)}
              aria-label="필터"
              aria-pressed={isFilterActive}
              className={`flex items-center justify-center w-[36px] h-[36px] shrink-0 border rounded-full ${
                isFilterActive ? "bg-primary-50 border-primary-100" : "bg-white border-gray-100"
              }`}
            >
              <Icon
                name={isFilterActive ? "filterActive" : "sort"}
                width={20}
                height={20}
                className={isFilterActive ? undefined : "text-gray-500"}
              />
            </button>
            <div className="relative flex flex-1 items-center gap-[12px] py-[16px] after:content-[''] after:absolute after:-left-[12px] after:top-1/2 after:-translate-y-1/2 after:h-3 after:w-[1px] after:bg-gray-50">
              {[
                { key: "product", label: "상품" },
                { key: "store", label: "스토어" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as "product" | "store")}
                  className={`flex-1 h-[36px] text-sm border rounded-full ${
                    activeTab === key
                      ? "text-primary bg-primary-50 border-primary-100"
                      : "text-gray-400 bg-white border-gray-100"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="px-5">
            {activeTab === "product" ? (
              <SearchProductListSection
                search={submittedTerm}
                minPrice={listFilter.minPrice}
                maxPrice={listFilter.maxPrice}
                productCategoryTypes={listFilter.productCategoryTypes}
                sortBy={sortBy}
              />
            ) : (
              <SearchStoreListSection search={submittedTerm} filter={listFilter} sortBy={sortBy} />
            )}
          </div>
        </>
      )}

      <SearchFilterSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filter={listFilter}
        onFilterChange={setListFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />
    </div>
  );
}
