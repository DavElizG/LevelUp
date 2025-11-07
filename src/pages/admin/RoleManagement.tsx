import { useState } from 'react';
import { useAllRoles } from '../../hooks/admin/useAdmin';
import { Shield, Plus, Edit2, Trash2, X, AlertTriangle } from 'lucide-react';
import type { Role } from '../../types/admin.types';

interface RoleDialogProps {
  role: Role | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (role: Partial<Role>) => void;
  isLoading: boolean;
}

function RoleDialog({ role, isOpen, onClose, onSave, isLoading }: RoleDialogProps) {
  const [formData, setFormData] = useState({
    name: role?.name || '',
    description: role?.description || '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: role?.id,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {role ? 'Editar Rol' : 'Crear Nuevo Rol'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Rol *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ej: Moderador"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Describe las responsabilidades de este rol..."
              />
            </div>

            {role && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Roles del Sistema</p>
                    <p>Los roles 'admin', 'editor' y 'user' son roles del sistema y no pueden ser eliminados. Solo puedes modificar su descripción.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Guardando...' : role ? 'Actualizar' : 'Crear Rol'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  roleName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

function DeleteConfirmDialog({ isOpen, roleName, onConfirm, onCancel, isLoading }: DeleteConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Eliminar Rol</h3>
          <p className="text-gray-600">
            ¿Estás seguro de que deseas eliminar el rol <strong>{roleName}</strong>? Esta acción no se puede deshacer y todos los usuarios con este rol lo perderán.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? 'Eliminando...' : 'Eliminar Rol'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function RoleManagement() {
  const { data: roles, isLoading } = useAllRoles();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  const systemRoles = ['admin', 'editor', 'user'];

  const handleCreateRole = () => {
    setSelectedRole(null);
    setIsDialogOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setIsDialogOpen(true);
  };

  const handleSaveRole = (roleData: Partial<Role>) => {
    // TODO: Implement role creation/update API call
    console.log('Saving role:', roleData);
    setIsDialogOpen(false);
    setSelectedRole(null);
  };

  const handleDeleteRole = () => {
    // TODO: Implement role deletion API call
    console.log('Deleting role:', roleToDelete);
    setRoleToDelete(null);
  };

  const isSystemRole = (roleName: string) => {
    return systemRoles.includes(roleName.toLowerCase());
  };

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'editor':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'user':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-purple-100 text-purple-800 border-purple-200';
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Roles</h1>
          <p className="text-gray-600 mt-1">Administra roles y permisos del sistema</p>
        </div>
        <button
          onClick={handleCreateRole}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Crear Rol
        </button>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          new Array(6).fill(0).map((_, i) => (
            <div key={`loading-${String(i)}`} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-lg"></div>
            </div>
          ))
        ) : roles && roles.length > 0 ? (
          roles.map((role) => (
            <div
              key={role.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${getRoleBadgeColor(role.name)}`}>
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                    {isSystemRole(role.name) && (
                      <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                        Rol del Sistema
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 min-h-[60px]">
                {role.description || 'Sin descripción'}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Creado: {new Date(role.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditRole(role)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    title="Editar rol"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {!isSystemRole(role.name) && (
                    <button
                      onClick={() => setRoleToDelete(role)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Eliminar rol"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No hay roles</h3>
            <p className="text-gray-500 mb-4">Crea el primer rol para comenzar</p>
            <button
              onClick={handleCreateRole}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Crear Rol
            </button>
          </div>
        )}
      </div>

      {/* Information Card */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Sobre los Roles del Sistema</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>• <strong>Admin:</strong> Acceso completo a todas las funciones administrativas del sistema</p>
          <p>• <strong>Editor:</strong> Puede editar contenido pero con permisos limitados de administración</p>
          <p>• <strong>User:</strong> Usuario estándar sin permisos administrativos</p>
          <p className="mt-4 pt-4 border-t border-blue-200">
            Los roles del sistema no pueden ser eliminados pero puedes editar sus descripciones. 
            Puedes crear roles personalizados para necesidades específicas de tu organización.
          </p>
        </div>
      </div>

      {/* Dialogs */}
      <RoleDialog
        role={selectedRole}
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedRole(null);
        }}
        onSave={handleSaveRole}
        isLoading={false}
      />

      <DeleteConfirmDialog
        isOpen={!!roleToDelete}
        roleName={roleToDelete?.name || ''}
        onConfirm={handleDeleteRole}
        onCancel={() => setRoleToDelete(null)}
        isLoading={false}
      />
    </div>
  );
}
