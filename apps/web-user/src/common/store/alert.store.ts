"use client";

import { create } from "zustand";

export type AlertType = "error" | "success" | "warning" | "info";

export interface AlertState {
  isOpen: boolean;
  type: AlertType;
  title: string;
  message: string;
  onClose?: () => void;
  /** 로그인 안내 알림 여부 (열려 있는 동안 다른 알림이 덮어쓰지 못함) */
  isLoginRequired?: boolean;
}

interface AlertStore {
  alert: AlertState;
  showAlert: (alert: Omit<AlertState, "isOpen">) => void;
  hideAlert: () => void;
}

export const useAlertStore = create<AlertStore>((set) => ({
  alert: {
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  },

  showAlert: (alert) => {
    set((state) => {
      // 401 로그인 안내가 떠 있는 동안엔 그 여파로 발생한 오류 알림이 안내를 덮어쓰지 않도록 무시
      if (state.alert.isOpen && state.alert.isLoginRequired && !alert.isLoginRequired) {
        return state;
      }
      return {
        alert: {
          ...alert,
          isOpen: true,
        },
      };
    });
  },

  hideAlert: () => {
    set((state) => ({
      alert: {
        ...state.alert,
        isOpen: false,
      },
    }));
  },
}));
