import { useState, useEffect } from 'react';
import { Shield, X } from 'lucide-react';
import type { AdminUser, Role } from '../../../../types/admin.types';

interface RoleAssignmentDialogProps {
  user: AdminUser | null;
  availableRoles: Role[];
  onClose: () => void;
  onSave: (userId: string, roleIds: string[]) => void;
  isLoading: boolean;
}

export function RoleAssignmentDialog({
  user,
  availableRoles,
  onClose,
  onSave,
  isLoading,
}: RoleAssignmentDialogProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      setSelectedRoles(user.roles?.map((r) => r.id) || []);
    }
  }, [user]);

  if (!user) return null;

  const handleToggleRole = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  const handleSave = () => {
    onSave(user.id, selectedRoles);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-blue-100">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Asignar Roles</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            <div className="space-y-3">
              {availableRoles.map((role) => (
                <label
                  key={role.id}
                  className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
                >
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role.id)}
                    onChange={() => handleToggleRole(role.id)}
                    className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={isLoading}
                  />
                  <div className="ml-3 flex-1">
                    <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {role.name}
                    </div>
                    {role.description && (
                      <div className="text-sm text-gray-500 mt-0.5">{role.description}</div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
