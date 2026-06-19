"use client";

import { useRef, useState } from "react";

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

export interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  /** 탭 클릭 시 탭 바가 상단 헤더 바로 아래로 오도록 스크롤할지 여부 (기본 false) */
  scrollOnSelect?: boolean;
  /** 스크롤 시 제외할 상단 고정 헤더 높이 (px, 기본 52 = 탭 바 sticky 기준) */
  scrollOffset?: number;
}

export function Tabs({
  tabs,
  defaultTab,
  scrollOnSelect = false,
  scrollOffset = 52,
}: TabsProps) {
  const [activeTab, setActiveTab] = useState<string>(defaultTab || tabs[0]?.id || "");
  // sticky 탭 바는 붙어있을 때 위치가 52px로 고정돼 위치 계산이 불가하므로,
  // 바로 앞에 둔 비-sticky 앵커로 스크롤한다(scrollIntoView가 스크롤 컨테이너를 자동 탐색).
  const anchorRef = useRef<HTMLDivElement>(null);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);

    if (!scrollOnSelect) return;

    // 콘텐츠 스왑 후 레이아웃이 반영된 다음 프레임에 스크롤
    requestAnimationFrame(() => {
      // scroll-margin-top(scrollOffset) 덕분에 헤더 높이만큼 띄워서 멈춘다
      anchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div className="bg-white rounded-xl">
      {/* 스크롤 기준 앵커 (sticky 아님: 탭 바의 실제 위치를 가리킴)
          scrollMarginTop = 헤더 높이만큼 띄워서 멈추도록 */}
      <div ref={anchorRef} aria-hidden className="h-0" style={{ scrollMarginTop: scrollOffset }} />
      {/* 탭 헤더 */}
      <div className="flex justify-center border-b border-gray-100 p-0 sticky top-[52px] bg-white z-30">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className="flex-1 h-[44px] flex items-center justify-center text-sm border-0 bg-transparent cursor-pointer transition-all duration-200"
          >
            <span
              className={`h-full flex items-center justify-center ${activeTab === tab.id ? "font-bold text-gray-900 border-b-2 border-gray-900" : "font-medium text-gray-500 border-b-2 border-transparent"}`}
            >
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* 탭 컨텐츠 */}
      <div className="py-[24px] px-[20px]">{tabs.find((tab) => tab.id === activeTab)?.content}</div>
    </div>
  );
}
