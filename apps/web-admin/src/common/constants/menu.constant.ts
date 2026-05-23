import React from "react";
import { Home } from "lucide-react";
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
  ];
}
