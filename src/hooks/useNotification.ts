import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastState {
  message: string;
  type: ToastType;
  isVisible: boolean;
}

interface ConfirmState {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  type: 'danger' | 'warning' | 'info';
  isVisible: boolean;
  onConfirm: (() => void) | null;
  onCancel: (() => void) | null;
}

interface NotificationStore {
  toast: ToastState;
  confirm: ConfirmState;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
  showConfirm: (
    title: string,
    message: string,
    options?: {
      confirmText?: string;
      cancelText?: string;
      type?: 'danger' | 'warning' | 'info';
    }
  ) => Promise<boolean>;
  hideConfirm: () => void;
}

export const useNotification = create<NotificationStore>((set, get) => ({
  toast: {
    message: '',
    type: 'info',
    isVisible: false,
  },
  confirm: {
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    type: 'warning',
    isVisible: false,
    onConfirm: null,
    onCancel: null,
  },

  showToast: (message: string, type: ToastType = 'info') => {
    set({
      toast: {
        message,
        type,
        isVisible: true,
      },
    });
  },

  hideToast: () => {
    set((state) => ({
      toast: {
        ...state.toast,
        isVisible: false,
      },
    }));
  },

  showConfirm: (
    title: string,
    message: string,
    options?: {
      confirmText?: string;
      cancelText?: string;
      type?: 'danger' | 'warning' | 'info';
    }
  ) => {
    return new Promise<boolean>((resolve) => {
      set({
        confirm: {
          title,
          message,
          confirmText: options?.confirmText || 'Confirmar',
          cancelText: options?.cancelText || 'Cancelar',
          type: options?.type || 'warning',
          isVisible: true,
          onConfirm: () => {
            get().hideConfirm();
            resolve(true);
          },
          onCancel: () => {
            get().hideConfirm();
            resolve(false);
          },
        },
      });
    });
  },

  hideConfirm: () => {
    set((state) => ({
      confirm: {
        ...state.confirm,
        isVisible: false,
        onConfirm: null,
        onCancel: null,
      },
    }));
  },
}));

// Helper functions para usar en lugar de alert() y confirm()
export const toast = {
  success: (message: string) => useNotification.getState().showToast(message, 'success'),
  error: (message: string) => useNotification.getState().showToast(message, 'error'),
  warning: (message: string) => useNotification.getState().showToast(message, 'warning'),
  info: (message: string) => useNotification.getState().showToast(message, 'info'),
};

export const confirm = async (
  title: string,
  message: string,
  options?: {
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
  }
): Promise<boolean> => {
  return useNotification.getState().showConfirm(title, message, options);
};
