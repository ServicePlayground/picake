"use client";

import { create } from "zustand";

interface LoginSheetStore {
  isOpen: boolean;
  openLoginSheet: () => void;
  closeLoginSheet: () => void;
}

export const useLoginSheetStore = create<LoginSheetStore>((set) => ({
  isOpen: false,
  openLoginSheet: () => set({ isOpen: true }),
  closeLoginSheet: () => set({ isOpen: false }),
}));
