import React from 'react';
import { toast, confirm } from '../../hooks/useNotification';

/**
 * NotificationDemo - Página de demostración del sistema de notificaciones
 * Esta página muestra ejemplos de uso de todos los tipos de notificaciones
 */
const NotificationDemo: React.FC = () => {
  const handleToastSuccess = () => {
    toast.success('¡Operación completada con éxito! 🎉');
  };

  const handleToastError = () => {
    toast.error('Error al procesar la solicitud');
  };

  const handleToastWarning = () => {
    toast.warning('Esta acción requiere confirmación');
  };

  const handleToastInfo = () => {
    toast.info('Recuerda guardar tus cambios');
  };

  const handleConfirmWarning = async () => {
    const confirmed = await confirm(
      'Advertencia',
      '¿Estás seguro de continuar con esta acción?',
      {
        confirmText: 'Continuar',
        cancelText: 'Cancelar',
        type: 'warning'
      }
    );

    if (confirmed) {
      toast.success('Confirmado');
    } else {
      toast.info('Cancelado');
    }
  };

  const handleConfirmDanger = async () => {
    const confirmed = await confirm(
      'Eliminar elemento',
      'Esta acción no se puede deshacer. ¿Estás seguro de eliminar este elemento?',
      {
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        type: 'danger'
      }
    );

    if (confirmed) {
      toast.success('Elemento eliminado');
    }
  };

  const handleConfirmInfo = async () => {
    const confirmed = await confirm(
      'Información importante',
      'Antes de continuar, asegúrate de haber leído toda la información.',
      {
        confirmText: 'He leído',
        cancelText: 'Volver',
        type: 'info'
      }
    );

    if (confirmed) {
      toast.success('Continuando...');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Sistema de Notificaciones</h1>
        <p className="text-gray-600 mb-8">Ejemplos interactivos de toasts y confirmaciones</p>

        {/* Toast Notifications */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Toast Notifications</h2>
          <p className="text-gray-600 mb-6">
            Notificaciones temporales que aparecen en la esquina superior derecha
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleToastSuccess}
              className="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors"
            >
              ✅ Success Toast
            </button>

            <button
              onClick={handleToastError}
              className="px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
            >
              ❌ Error Toast
            </button>

            <button
              onClick={handleToastWarning}
              className="px-6 py-3 bg-yellow-500 text-white rounded-xl font-semibold hover:bg-yellow-600 transition-colors"
            >
              ⚠️ Warning Toast
            </button>

            <button
              onClick={handleToastInfo}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
            >
              ℹ️ Info Toast
            </button>
          </div>
        </div>

        {/* Confirm Dialogs */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Confirm Dialogs</h2>
          <p className="text-gray-600 mb-6">
            Diálogos modales para confirmar acciones importantes
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleConfirmWarning}
              className="px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors"
            >
              ⚠️ Warning Confirm
            </button>

            <button
              onClick={handleConfirmDanger}
              className="px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
            >
              🗑️ Danger Confirm
            </button>

            <button
              onClick={handleConfirmInfo}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
            >
              ℹ️ Info Confirm
            </button>
          </div>
        </div>

        {/* Code Examples */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ejemplos de Código</h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Toast Simple</h3>
              <pre className="bg-gray-100 rounded-lg p-4 overflow-x-auto">
                <code>{`import { toast } from '../hooks/useNotification';

toast.success('¡Operación exitosa!');
toast.error('Error al procesar');
toast.warning('Advertencia');
toast.info('Información');`}</code>
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Confirm con Async/Await</h3>
              <pre className="bg-gray-100 rounded-lg p-4 overflow-x-auto">
                <code>{`import { confirm, toast } from '../hooks/useNotification';

const handleDelete = async () => {
  const confirmed = await confirm(
    'Eliminar elemento',
    '¿Estás seguro?',
    { type: 'danger' }
  );

  if (confirmed) {
    await deleteItem();
    toast.success('Eliminado');
  }
};`}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDemo;
