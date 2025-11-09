import { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import { useUsersList, useUpdateUserRoles } from '../../../hooks/admin/useAdmin';
import { useBanUser, useUnbanUser } from './hooks';
import { UserTable, BanUserModal, RoleAssignmentDialog } from './components';
import { ConfirmDialog } from '../../../components/common';
import type { AdminUser, Role } from '../../../types/admin.types';

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'banned'>('active');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userToBan, setUserToBan] = useState<AdminUser | null>(null);
  const [userToUnban, setUserToUnban] = useState<AdminUser | null>(null);

  const { data: usersData, isLoading } = useUsersList({
    search: searchTerm || undefined,
    role: roleFilter !== 'all' ? roleFilter : undefined,
  });

  const updateRolesMutation = useUpdateUserRoles();
  const banUserMutation = useBanUser();
  const unbanUserMutation = useUnbanUser();

  const users = useMemo(() => usersData || [], [usersData]);

  const availableRoles: Role[] = useMemo(
    () => [
      {
        id: 'admin',
        name: 'Administrador',
        description: 'Acceso completo al sistema',
        permissions: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'editor',
        name: 'Editor',
        description: 'Puede editar contenido',
        permissions: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'user',
        name: 'Usuario',
        description: 'Usuario estándar',
        permissions: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    []
  );

  const filteredUsers = useMemo(() => {
    let filtered = users;

    if (statusFilter === 'active') {
      filtered = filtered.filter((user: AdminUser) => !user.is_banned);
    } else if (statusFilter === 'banned') {
      filtered = filtered.filter((user: AdminUser) => user.is_banned);
    }

    return filtered;
  }, [users, statusFilter]);

  const handleUpdateRoles = (userId: string, roleIds: string[]) => {
    updateRolesMutation.mutate(
      { userId, roles: roleIds },
      {
        onSuccess: () => {
          setSelectedUser(null);
        },
      }
    );
  };

  const handleBanUser = (reason: string, durationDays: number | null) => {
    if (!userToBan) return;

    banUserMutation.mutate(
      {
        userId: userToBan.id,
        reason,
        durationDays,
      },
      {
        onSuccess: () => {
          setUserToBan(null);
        },
      }
    );
  };

  const handleUnbanUser = () => {
    if (!userToUnban) return;

    unbanUserMutation.mutate(userToUnban.id, {
      onSuccess: () => {
        setUserToUnban(null);
      },
    });
  };

  const getBanExpirationText = (bannedUntil: string | null): string => {
    if (!bannedUntil) return 'Permanente';

    const until = new Date(bannedUntil);
    const now = new Date();
    const diffDays = Math.ceil((until.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return 'Expirado';
    if (diffDays === 1) return '1 día restante';
    return `${diffDays} días restantes`;
  };

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'admin':
      case 'administrador':
        return 'bg-red-100 text-red-800';
      case 'editor':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <p className="text-gray-600 mt-1">Administra usuarios, roles y permisos del sistema</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los roles</option>
              <option value="admin">Administradores</option>
              <option value="editor">Editores</option>
              <option value="user">Usuarios</option>
            </select>
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'banned')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="active">Activos</option>
              <option value="banned">Baneados</option>
              <option value="all">Todos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <UserTable
        users={filteredUsers}
        isLoading={isLoading}
        onSelectUser={setSelectedUser}
        onBanUser={setUserToBan}
        onUnbanUser={setUserToUnban}
        getBanExpirationText={getBanExpirationText}
        getRoleBadgeColor={getRoleBadgeColor}
      />

      {/* Dialogs */}
      <RoleAssignmentDialog
        user={selectedUser}
        availableRoles={availableRoles}
        onClose={() => setSelectedUser(null)}
        onSave={handleUpdateRoles}
        isLoading={updateRolesMutation.isPending}
      />

      <BanUserModal
        isOpen={!!userToBan}
        user={userToBan}
        onClose={() => setUserToBan(null)}
        onConfirm={handleBanUser}
        isLoading={banUserMutation.isPending}
      />

      <ConfirmDialog
        isOpen={!!userToUnban}
        title="Desbanear Usuario"
        message={
          <div>
            <p className="mb-2">
              ¿Deseas desbanear al usuario <strong>{userToUnban?.email}</strong>?
            </p>
            <p className="text-sm text-gray-500">
              El usuario podrá volver a acceder a su cuenta inmediatamente.
            </p>
          </div>
        }
        onConfirm={handleUnbanUser}
        onCancel={() => setUserToUnban(null)}
        isLoading={unbanUserMutation.isPending}
        confirmText="Desbanear"
        variant="info"
      />
    </div>
  );
}
