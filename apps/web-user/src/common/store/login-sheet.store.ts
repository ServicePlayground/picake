"use client";

import { create } from "zustand";
import type { LoginEntryPoint } from "@/apps/web-user/common/types/analytics.type";

interface LoginSheetStore {
  isOpen: boolean;
  /** 로그인 시트를 연 트리거 지점 (view_login_entry 이벤트용) */
  entryPoint: LoginEntryPoint | null;
  openLoginSheet: (entryPoint: LoginEntryPoint) => void;
  closeLoginSheet: () => void;
}

export const useLoginSheetStore = create<LoginSheetStore>((set) => ({
  isOpen: false,
  entryPoint: null,
  openLoginSheet: (entryPoint) => set({ isOpen: true, entryPoint }),
  closeLoginSheet: () => set({ isOpen: false }),
}));
