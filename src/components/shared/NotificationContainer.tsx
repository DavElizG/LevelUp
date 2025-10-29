import React from 'react';
import { useNotification } from '../../hooks/useNotification';
import Toast from './Toast';
import ConfirmDialog from './ConfirmDialog';

/**
 * NotificationContainer - Componente global para renderizar toasts y dialogs
 * Debe ser incluido una vez en el árbol de componentes (App.tsx)
 */
const NotificationContainer: React.FC = () => {
  const { toast, confirm, hideToast } = useNotification();

  return (
    <>
      {/* Toast Notification */}
      {toast.isVisible && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}

      {/* Confirm Dialog */}
      {confirm.isVisible && confirm.onConfirm && confirm.onCancel && (
        <ConfirmDialog
          title={confirm.title}
          message={confirm.message}
          confirmText={confirm.confirmText}
          cancelText={confirm.cancelText}
          type={confirm.type}
          onConfirm={confirm.onConfirm}
          onCancel={confirm.onCancel}
        />
      )}
    </>
  );
};

export default NotificationContainer;
