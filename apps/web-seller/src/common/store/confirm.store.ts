import { create } from "zustand";

export const CONFIRM_DEFAULT_TITLE = "안내 메시지";

export interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface ConfirmStore {
  confirm: ConfirmState;
  showConfirm: (
    confirm: Partial<Omit<ConfirmState, "isOpen">> & Pick<ConfirmState, "message">,
  ) => void;
  hideConfirm: () => void;
}

const initialConfirm: ConfirmState = {
  isOpen: false,
  title: CONFIRM_DEFAULT_TITLE,
  message: "",
  confirmLabel: "확인",
  cancelLabel: "취소",
};

export const useConfirmStore = create<ConfirmStore>((set) => ({
  confirm: initialConfirm,

  showConfirm: (confirm) => {
    set({
      confirm: {
        ...initialConfirm,
        ...confirm,
        title: confirm.title ?? CONFIRM_DEFAULT_TITLE,
        confirmLabel: confirm.confirmLabel ?? "확인",
        cancelLabel: confirm.cancelLabel ?? "취소",
        isOpen: true,
      },
    });
  },

  hideConfirm: () => {
    set({ confirm: initialConfirm });
  },
}));
