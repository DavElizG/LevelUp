import { type ReactNode } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string | ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isLoading = false,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'info',
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-orange-600 hover:bg-orange-700',
    info: 'bg-blue-600 hover:bg-blue-700',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
          onClick={onCancel}
        />

        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <div className="text-gray-600">{message}</div>
          </div>

          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
              disabled={isLoading}
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg text-white ${variantStyles[variant]} disabled:opacity-50 transition-colors`}
            >
              {isLoading ? 'Procesando...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
