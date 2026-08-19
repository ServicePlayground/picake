"use client";

import Image from "next/image";
import type { ReactNode } from "react";

const SUPPORT_EMAIL = "picakeee@gmail.com";
const SUPPORT_PHONE = "010-3007-5647";
const KAKAO_CHANNEL_NAME = "픽케이크";
const INSTAGRAM_HANDLE = "picake_app";

function MailIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className="text-gray-900"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M4 7l8 6 8-6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface SupportRowProps {
  icon: ReactNode;
  label: string;
  value: string;
}

/** 탭 동작 없이 라벨/값만 보여주는 정보 행 */
function SupportRow({ icon, label, value }: SupportRowProps) {
  return (
    <div className="w-full flex items-center gap-3 px-5 py-4 border-b border-gray-100">
      <div className="w-6 h-6 shrink-0 flex items-center justify-center">{icon}</div>
      <div className="flex-1 text-left">
        <p className="text-sm font-bold text-gray-900">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

/**
 * 마이페이지 > 고객센터.
 * 로그인 없이도 접근 가능해야 함 — App Store 심사(가이드라인 1.5)의 Support URL이 이 화면을 가리킴.
 */
export function CustomerSupportScreen() {
  return (
    <div className="pt-4 pb-10">
      <SupportRow icon={<MailIcon />} label="이메일" value={SUPPORT_EMAIL} />
      <SupportRow
        icon={
          <Image
            src="/images/contents/talk_phone.png"
            alt="전화 문의"
            width={24}
            height={24}
            className="w-6 h-6 rounded-full object-cover"
          />
        }
        label="전화 문의"
        value={SUPPORT_PHONE}
      />
      <SupportRow
        icon={
          <Image
            src="/images/contents/talk_kakao.png"
            alt="카카오톡 채널"
            width={24}
            height={24}
            className="w-6 h-6 rounded-full object-cover"
          />
        }
        label="카카오톡 채널"
        value={KAKAO_CHANNEL_NAME}
      />
      <SupportRow
        icon={
          <Image
            src="/images/contents/talk_insta.png"
            alt="인스타그램"
            width={24}
            height={24}
            className="w-6 h-6 rounded-full object-cover"
          />
        }
        label="인스타그램"
        value={`@${INSTAGRAM_HANDLE}`}
      />
    </div>
  );
}
