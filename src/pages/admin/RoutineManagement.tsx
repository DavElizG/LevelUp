import { useState, useMemo } from 'react';
import { useRoutinesStats, useUpdateRoutine } from '../../hooks/admin/useAdmin';
import { Search, Filter, Dumbbell, Check, X, Eye, EyeOff, Edit2, TrendingUp } from 'lucide-react';
import type { RoutineStats } from '../../types/admin.types';

interface RoutineDetailsDialogProps {
  routine: RoutineStats | null;
  onClose: () => void;
  onUpdate: (routineId: string, updates: Record<string, unknown>) => void;
  isLoading: boolean;
}

function RoutineDetailsDialog({ routine, onClose, onUpdate, isLoading }: RoutineDetailsDialogProps) {
  if (!routine) return null;

  const handleTogglePublic = () => {
    onUpdate(routine.id, { is_public: !routine.is_public });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl my-8">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Detalles de la Rutina</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Routine Info */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">{routine.name}</h4>
            <p className="text-gray-600 text-sm">Rutina creada por {routine.creator_name || routine.creator_email}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Objetivo</p>
              <p className="font-semibold text-gray-900">{routine.goal || 'N/A'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Nivel</p>
              <p className="font-semibold text-gray-900">{routine.difficulty_level || 'N/A'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Días/Semana</p>
              <p className="font-semibold text-gray-900">{routine.days_per_week || 0}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Total Ejercicios</p>
              <p className="font-semibold text-gray-900">{routine.stats?.total_exercises || 0}</p>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 mb-1">Creado por</p>
            <p className="font-medium text-blue-900">{routine.creator_email || 'Usuario desconocido'}</p>
            <p className="text-xs text-blue-700 mt-1">
              Fecha: {new Date(routine.created_at).toLocaleString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          {/* Usage Stats */}
          <div>
            <h5 className="font-medium text-gray-900 mb-3">Estadísticas de Uso</h5>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Sesiones</span>
                <span className="font-semibold text-gray-900">{routine.stats?.total_sessions || 0} veces</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Usuarios únicos</span>
                <span className="text-sm text-gray-900">{routine.stats?.unique_users || 0}</span>
              </div>
            </div>
          </div>

          {/* Public Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 mb-1">Visibilidad Pública</p>
              <p className="text-sm text-gray-600">
                {routine.is_public
                  ? 'Esta rutina es visible para todos los usuarios'
                  : 'Esta rutina es privada, solo el creador puede verla'}
              </p>
            </div>
            <button
              onClick={handleTogglePublic}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                routine.is_public
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              } disabled:opacity-50`}
            >
              {routine.is_public ? (
                <>
                  <Eye className="w-4 h-4" />
                  Pública
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4" />
                  Privada
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export function RoutineManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'private'>('all');
  const [selectedRoutine, setSelectedRoutine] = useState<RoutineStats | null>(null);

  const { data: routines, isLoading } = useRoutinesStats({
    search: searchTerm || undefined,
    is_public: visibilityFilter === 'all' ? undefined : visibilityFilter === 'public',
  });

  const updateRoutineMutation = useUpdateRoutine();

  const filteredRoutines = useMemo(() => {
    return routines || [];
  }, [routines]);

  const handleUpdateRoutine = (routineId: string, updates: Record<string, unknown>) => {
    updateRoutineMutation.mutate(
      { routineId, updates },
      {
        onSuccess: () => {
          setSelectedRoutine(null);
        },
      }
    );
  };

  const handleTogglePublic = (routine: RoutineStats, e: React.MouseEvent) => {
    e.stopPropagation();
    handleUpdateRoutine(routine.id, { is_public: !routine.is_public });
  };

  const getGoalBadgeColor = (goal: string | null) => {
    if (!goal) return 'bg-gray-100 text-gray-800';
    const g = goal.toLowerCase();
    if (g.includes('músculo') || g.includes('hipertrofia')) return 'bg-purple-100 text-purple-800';
    if (g.includes('fuerza')) return 'bg-red-100 text-red-800';
    if (g.includes('resistencia')) return 'bg-blue-100 text-blue-800';
    if (g.includes('pérdida') || g.includes('peso')) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getLevelBadgeColor = (level: string | null) => {
    if (!level) return 'bg-gray-100 text-gray-800';
    const l = level.toLowerCase();
    if (l.includes('principiante')) return 'bg-green-100 text-green-800';
    if (l.includes('intermedio')) return 'bg-yellow-100 text-yellow-800';
    if (l.includes('avanzado')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Rutinas</h1>
        <p className="text-gray-600 mt-1">Administra, aprueba y modera rutinas de entrenamiento</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Rutinas</p>
              <p className="text-3xl font-bold text-gray-900">{filteredRoutines.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Dumbbell className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Rutinas Públicas</p>
              <p className="text-3xl font-bold text-gray-900">
                {filteredRoutines.filter(r => r.is_public).length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Más Usadas</p>
              <p className="text-3xl font-bold text-gray-900">
                {filteredRoutines.filter(r => (r.stats?.total_sessions || 0) > 10).length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar rutinas por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value as 'all' | 'public' | 'private')}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas las rutinas</option>
              <option value="public">Públicas</option>
              <option value="private">Privadas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Routines Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8">
            <div className="animate-pulse space-y-4">
              {new Array(5).fill(0).map((_, i) => (
                <div key={`loading-${String(i)}`} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : filteredRoutines.length === 0 ? (
          <div className="p-8 text-center">
            <Dumbbell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No hay rutinas</h3>
            <p className="text-gray-500">No se encontraron rutinas con los filtros aplicados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rutina
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Creador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Detalles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRoutines.map((routine) => (
                  <tr
                    key={routine.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedRoutine(routine)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                          <Dumbbell className="w-5 h-5 text-white" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{routine.name}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(routine.created_at).toLocaleDateString('es-ES')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{routine.creator_email || 'Desconocido'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {routine.goal && (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getGoalBadgeColor(routine.goal)}`}>
                            {routine.goal}
                          </span>
                        )}
                        {routine.difficulty_level && (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getLevelBadgeColor(routine.difficulty_level)}`}>
                            {routine.difficulty_level}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {routine.days_per_week} días/semana • {routine.stats?.total_exercises || 0} ejercicios
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{routine.stats?.total_sessions || 0} sesiones</div>
                      <div className="text-xs text-gray-500">
                        {routine.stats?.unique_users || 0} usuarios únicos
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {routine.is_public ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Check className="w-3 h-3 mr-1" />
                          Pública
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <X className="w-3 h-3 mr-1" />
                          Privada
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedRoutine(routine)}
                          className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded"
                          title="Ver detalles"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleTogglePublic(routine, e)}
                          className={`p-2 rounded ${
                            routine.is_public
                              ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                              : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                          }`}
                          title={routine.is_public ? 'Hacer privada' : 'Hacer pública'}
                        >
                          {routine.is_public ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Routine Details Dialog */}
      <RoutineDetailsDialog
        routine={selectedRoutine}
        onClose={() => setSelectedRoutine(null)}
        onUpdate={handleUpdateRoutine}
        isLoading={updateRoutineMutation.isPending}
      />
    </div>
  );
}
