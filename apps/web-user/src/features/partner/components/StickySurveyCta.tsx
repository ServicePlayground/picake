"use client";

import { useEffect, useState } from "react";
import { PARTNER_SURVEY_URL } from "@/apps/web-user/common/constants/partner.constants";

interface StickySurveyCtaProps {
  /** 이 요소가 화면에 보이는 동안에는 하단 버튼을 숨긴다(같은 버튼이 두 개 보이지 않게) */
  watchIds: string[];
}

/**
 * 히어로 CTA가 화면 밖으로 나가면 하단에 고정되는 설문 버튼.
 * 그라데이션은 페이지 배경과 같은 흰색 기준이다. 배경색이 바뀌면 여기도 같이 바꿔야
 * 어두운 섹션 위에 흰 띠로 떠 보이는 일이 생기지 않는다.
 */
export function StickySurveyCta({ watchIds }: StickySurveyCtaProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const targets = watchIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    const visible = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
      setShow(visible.size === 0);
    });
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [watchIds]);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 mx-auto w-full sm:w-[640px] bg-gradient-to-t from-white via-white/95 to-white/0 px-5 pt-7 pb-[calc(16px+env(safe-area-inset-bottom))] transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"
      }`}
    >
      <a
        href={PARTNER_SURVEY_URL}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={show ? 0 : -1}
        className="flex h-[54px] w-full items-center justify-center rounded-xl bg-primary text-base font-extrabold text-gray-900 shadow-[0_10px_30px_-12px_rgba(255,101,62,0.8)] transition-transform duration-150 active:scale-[0.98]"
      >
        5분 설문 참여하기
      </a>
    </div>
  );
}
