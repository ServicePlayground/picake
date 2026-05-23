import { create } from "zustand";

export interface AlertItem {
  id: string;
  message: string;
  title?: string;
  severity: "error" | "warning" | "info" | "success";
  variant?: "filled" | "outlined" | "standard";
  autoHideDuration?: number | null; // null이면 자동으로 사라지지 않음
}

interface AlertStore {
  alerts: AlertItem[];
  addAlert: (alert: Omit<AlertItem, "id">) => string;
  removeAlert: (id: string) => void;
  clearAllAlerts: () => void;
}

export const useAlertStore = create<AlertStore>((set) => ({
  alerts: [],

  addAlert: (alert) => {
    const id = `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newAlert: AlertItem = {
      ...alert,
      id,
      autoHideDuration: alert.autoHideDuration ?? 6000, // 기본 6초
    };

    set((state) => ({
      alerts: [...state.alerts, newAlert],
    }));

    return id;
  },

  removeAlert: (id) => {
    set((state) => ({
      alerts: state.alerts.filter((alert) => alert.id !== id),
    }));
  },

  clearAllAlerts: () => {
    set({ alerts: [] });
  },
}));
