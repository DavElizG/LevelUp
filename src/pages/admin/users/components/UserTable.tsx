import { Ban, ShieldOff, Shield, Mail, Calendar, Clock } from 'lucide-react';
import { TableSkeleton } from '../../../../components/common/Skeleton';
import type { AdminUser } from '../../../../types/admin.types';

interface UserTableProps {
  users: AdminUser[];
  isLoading: boolean;
  onSelectUser: (user: AdminUser) => void;
  onBanUser: (user: AdminUser) => void;
  onUnbanUser: (user: AdminUser) => void;
  getBanExpirationText: (bannedUntil: string | null) => string;
  getRoleBadgeColor: (roleName: string) => string;
}

export function UserTable({
  users,
  isLoading,
  onSelectUser,
  onBanUser,
  onUnbanUser,
  getBanExpirationText,
  getRoleBadgeColor,
}: UserTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <TableSkeleton rows={10} columns={6} />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">No se encontraron usuarios</p>
        <p className="text-sm text-gray-500 mt-1">
          Intenta ajustar los filtros de búsqueda
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Usuario
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Roles
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Estado
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Registro
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Último acceso
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.email}</div>
                      {user.full_name && (
                        <div className="text-sm text-gray-500">{user.full_name}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-wrap gap-1">
                    {user.roles && user.roles.length > 0 ? (
                      user.roles.map((role) => (
                        <span
                          key={role.id}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                            role.name
                          )}`}
                        >
                          {role.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-400">Sin roles</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.is_banned ? (
                    <div className="flex flex-col gap-1 group relative">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <Ban className="w-3 h-3 mr-1" />
                        Baneado
                      </span>
                      <span className="text-xs text-gray-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {getBanExpirationText(user.banned_until)}
                      </span>
                      {user.banned_reason && (
                        <span className="text-xs text-gray-400 italic truncate max-w-[150px]" title={user.banned_reason}>
                          {user.banned_reason}
                        </span>
                      )}
                      {/* Tooltip on hover */}
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                        <div className="space-y-1">
                          {user.banned_reason && (
                            <p><span className="font-semibold">Razón:</span> {user.banned_reason}</p>
                          )}
                          {user.banned_at && (
                            <p><span className="font-semibold">Baneado el:</span> {new Date(user.banned_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          )}
                          {user.banned_until ? (
                            <p><span className="font-semibold">Expira:</span> {new Date(user.banned_until).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          ) : (
                            <p><span className="font-semibold">Duración:</span> Permanente</p>
                          )}
                        </div>
                        <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Activo
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1.5 text-gray-400" />
                    {new Date(user.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'Nunca'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    {!user.is_banned ? (
                      <>
                        <button
                          onClick={() => onSelectUser(user)}
                          className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Asignar roles"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onBanUser(user)}
                          className="text-orange-600 hover:text-orange-900 p-2 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Banear usuario"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => onUnbanUser(user)}
                        className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded-lg transition-colors"
                        title="Desbanear usuario"
                      >
                        <ShieldOff className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
