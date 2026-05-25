import React from "react";
import { Home, ShieldCheck } from "lucide-react";
import { ROUTES } from "./paths.constant";

export interface MenuChildItem {
  text: string;
  path: string;
}

export interface MenuItem {
  text: string;
  icon?: React.ReactElement;
  path?: string;
  children?: MenuChildItem[];
}

export function getMenuItems(): MenuItem[] {
  return [
    {
      text: "홈",
      icon: React.createElement(Home, { className: "w-5 h-5" }),
      path: ROUTES.ROOT,
    },
    {
      text: "관리자",
      icon: React.createElement(ShieldCheck, { className: "w-5 h-5" }),
      children: [
        { text: "가입 신청 내역", path: ROUTES.ADMIN_MANAGEMENT.REQUESTS },
        { text: "계정 관리", path: ROUTES.ADMIN_MANAGEMENT.ACCOUNTS },
        { text: "가입 설정", path: ROUTES.ADMIN_MANAGEMENT.SETTINGS },
      ],
    },
  ];
}
