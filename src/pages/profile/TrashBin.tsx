import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Trash2, 
  RotateCcw, 
  Clock, 
  AlertTriangle, 
  Dumbbell, 
  Apple,
  ArrowLeft,
  Info
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import DeletedItemDetailModal from './components/DeletedItemDetailModal';

export interface DeletedItem {
  id: string;
  title: string;
  deleted_at: string;
  expires_at: string;
  type: 'routine' | 'diet';
  original_data?: Record<string, unknown>;
}

const TrashBin: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = React.useState<DeletedItem | null>(null);

  // Get user subscription
  const { data: subscription } = useQuery({
    queryKey: ['user-subscription'],
    queryFn: async () => {
      if (!supabase) return null;
      const { data, error } = await supabase.rpc('get_user_subscription').single();
      if (error) return null;
      return data as { plan: string } | null;
    },
  });

  const plan = subscription?.plan || 'free';
  
  // Get retention days based on plan
  const retentionDays = plan === 'free' ? 7 : plan === 'pro' ? 30 : 90;

  // Get deleted routines
  const { data: deletedRoutines = [], isLoading: loadingRoutines } = useQuery({
    queryKey: ['deleted-routines'],
    queryFn: async () => {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from('deleted_workout_routines')
        .select('*')
        .order('deleted_at', { ascending: false });
      
      if (error) throw error;
      return data.map(item => ({
        id: item.id,
        title: item.name || item.title || 'Rutina sin nombre',
        deleted_at: item.deleted_at,
        expires_at: item.expires_at,
        type: 'routine' as const,
        original_data: item.original_data as Record<string, unknown>,
      }));
    },
  });

  // Get deleted diet plans
  const { data: deletedDiets = [], isLoading: loadingDiets } = useQuery({
    queryKey: ['deleted-diets'],
    queryFn: async () => {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from('deleted_diet_plans')
        .select('*')
        .order('deleted_at', { ascending: false });
      
      if (error) throw error;
      return data.map(item => ({
        id: item.id,
        title: item.name || item.title || 'Plan de dieta sin nombre',
        deleted_at: item.deleted_at,
        expires_at: item.expires_at,
        type: 'diet' as const,
        original_data: item.original_data as Record<string, unknown>,
      }));
    },
  });

  // Restore mutation
  const restoreMutation = useMutation({
    mutationFn: async ({ id, type }: { id: string; type: 'routine' | 'diet' }) => {
      if (!supabase) throw new Error('Supabase not initialized');
      
      const procedureName = type === 'routine' 
        ? 'restore_routine_from_trash' 
        : 'restore_diet_from_trash';
      
      const { error } = await supabase.rpc(procedureName, { p_item_id: id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deleted-routines'] });
      queryClient.invalidateQueries({ queryKey: ['deleted-diets'] });
      queryClient.invalidateQueries({ queryKey: ['workout-routines'] });
      queryClient.invalidateQueries({ queryKey: ['diet-plans'] });
    },
  });

  // Permanent delete mutation
  const deletePermanentlyMutation = useMutation({
    mutationFn: async ({ id, type }: { id: string; type: 'routine' | 'diet' }) => {
      if (!supabase) throw new Error('Supabase not initialized');
      
      const procedureName = type === 'routine' 
        ? 'permanently_delete_routine_from_trash' 
        : 'permanently_delete_diet_from_trash';
      
      const { error } = await supabase.rpc(procedureName, { p_item_id: id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deleted-routines'] });
      queryClient.invalidateQueries({ queryKey: ['deleted-diets'] });
    },
  });

  // Empty trash mutation
  const emptyTrashMutation = useMutation({
    mutationFn: async () => {
      if (!supabase) throw new Error('Supabase not initialized');
      const { error } = await supabase.rpc('empty_trash');
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deleted-routines'] });
      queryClient.invalidateQueries({ queryKey: ['deleted-diets'] });
    },
  });

  const allItems: DeletedItem[] = [...deletedRoutines, ...deletedDiets];
  const isLoading = loadingRoutines || loadingDiets;

  const handleRestore = (id: string, type: 'routine' | 'diet') => {
    restoreMutation.mutate({ id, type });
  };

  const handlePermanentDelete = (id: string, type: 'routine' | 'diet') => {
    deletePermanentlyMutation.mutate({ id, type });
  };

  const handleEmptyTrash = () => {
    if (window.confirm('¿Estás seguro de que quieres vaciar la papelera? Esta acción no se puede deshacer.')) {
      emptyTrashMutation.mutate();
    }
  };

  const getDaysRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <span className="font-medium">Volver</span>
        </button>

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Papelera de Reciclaje
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Elementos eliminados • Se conservan por {retentionDays} días
                </p>
              </div>
            </div>
            
            {allItems.length > 0 && (
              <button
                onClick={handleEmptyTrash}
                disabled={emptyTrashMutation.isPending}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {emptyTrashMutation.isPending ? 'Vaciando...' : 'Vaciar Papelera'}
              </button>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Plan Info */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-4 border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Plan {plan.toUpperCase()}
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Retención: {retentionDays} días
                </p>
              </div>
            </div>
          </div>

          {/* Items Count */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border-2 border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-3">
              <Trash2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                  {allItems.length} elementos
                </p>
                <p className="text-xs text-purple-700 dark:text-purple-300">
                  En la papelera
                </p>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-4 border-2 border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <div>
                <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                  Auto-eliminación
                </p>
                <p className="text-xs text-orange-700 dark:text-orange-300">
                  Tras {retentionDays} días
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Upgrade Info for Free Users */}
        {plan === 'free' && (
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg shadow-lg p-6 mb-8 border-2 border-orange-200 dark:border-orange-800">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-2">
                  Aviso Importante - Plan Gratuito
                </h3>
                <div className="space-y-2 text-sm text-orange-800 dark:text-orange-200">
                  <p>
                    🗑️ Los elementos eliminados se conservan por <strong>7 días</strong> antes de ser eliminados permanentemente.
                  </p>
                  <p>
                    ⚠️ <strong>Si desinstalas la aplicación, todos los elementos en la papelera se eliminarán inmediatamente y de forma permanente.</strong>
                  </p>
                  <p>
                    💎 Actualiza a <strong>PRO</strong> (30 días) o <strong>PREMIUM</strong> (90 días) para mayor tiempo de retención y protección de datos.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/subscription')}
                  className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Ver Planes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Items List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : allItems.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
            <Trash2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Papelera Vacía
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              No hay elementos eliminados
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {allItems.map((item) => {
              const daysRemaining = getDaysRemaining(item.expires_at);
              const isExpiringSoon = daysRemaining <= 3;
              
              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        item.type === 'routine'
                          ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                          : 'bg-gradient-to-br from-green-500 to-emerald-500'
                      }`}>
                        {item.type === 'routine' ? (
                          <Dumbbell className="w-6 h-6 text-white" />
                        ) : (
                          <Apple className="w-6 h-6 text-white" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {item.title}
                        </h3>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              Eliminado {new Date(item.deleted_at).toLocaleDateString('es-ES')}
                            </span>
                          </div>
                          <div className={`flex items-center gap-1 ${
                            isExpiringSoon ? 'text-red-600 dark:text-red-400 font-semibold' : ''
                          }`}>
                            <AlertTriangle className="w-4 h-4" />
                            <span>
                              {daysRemaining > 0 
                                ? `Se elimina en ${daysRemaining} día${daysRemaining !== 1 ? 's' : ''}`
                                : 'Expira hoy'
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
                        title="Ver detalles"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRestore(item.id, item.type)}
                        disabled={restoreMutation.isPending}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Restaurar
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('¿Estás seguro de que quieres eliminar permanentemente este elemento? Esta acción NO se puede deshacer.')) {
                            handlePermanentDelete(item.id, item.type);
                          }
                        }}
                        disabled={deletePermanentlyMutation.isPending}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Eliminar permanentemente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <DeletedItemDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onRestore={handleRestore}
        onPermanentDelete={handlePermanentDelete}
      />
    </div>
  );
};

export default TrashBin;
