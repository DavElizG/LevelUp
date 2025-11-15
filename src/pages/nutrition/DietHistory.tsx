import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Calendar, Target, TrendingUp, CheckCircle, Play } from 'lucide-react';
import { cn } from '../../lib/utils';
import BottomNavbar from '../../components/shared/BottomNavbar';
import { toast } from '../../hooks/useNotification';

interface DietPlan {
  id: string;
  user_id: string;
  name: string;
  description: string;
  goal: string;
  target_calories: number;
  target_protein_g?: number;
  target_carbs_g?: number;
  target_fat_g?: number;
  is_active: boolean;
  generated_by_ai: boolean;
  created_at: string;
  updated_at: string;
}

const DietHistory: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plans, setPlans] = useState<DietPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadPlans = async () => {
    if (!user || !supabase) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('diet_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error loading diet plans:', error);
      toast.error('Error al cargar el historial de planes');
    } finally {
      setLoading(false);
    }
  };

  const activatePlan = async (planId: string) => {
    if (!user || !supabase) return;

    try {
      // Desactivar todos los planes
      const { error: deactivateError } = await supabase
        .from('diet_plans')
        .update({ is_active: false })
        .eq('user_id', user.id);

      if (deactivateError) throw deactivateError;

      // Activar el plan seleccionado
      const { error: activateError } = await supabase
        .from('diet_plans')
        .update({ is_active: true })
        .eq('id', planId);

      if (activateError) throw activateError;

      toast.success('Plan activado correctamente');
      loadPlans();
    } catch (error) {
      console.error('Error activating plan:', error);
      toast.error('Error al activar el plan');
    }
  };

  const getGoalLabel = (goal: string) => {
    const labels: Record<string, string> = {
      perder_peso: 'Perder Peso',
      ganar_musculo: 'Ganar Músculo',
      mantener: 'Mantener',
      ganar_peso: 'Ganar Peso',
      mejorar_salud: 'Mejorar Salud',
    };
    return labels[goal] || goal;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30 dark:from-gray-900 dark:via-green-900/10 dark:to-emerald-900/10 pb-24">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30 dark:from-gray-900 dark:via-green-900/10 dark:to-emerald-900/10 pb-20 overflow-hidden">
      {/* Burbujas decorativas */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-gradient-to-br from-green-300/30 to-emerald-400/30 dark:from-green-600/20 dark:to-emerald-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="fixed top-1/3 right-0 w-80 h-80 bg-gradient-to-br from-teal-300/30 to-cyan-400/30 dark:from-teal-600/20 dark:to-cyan-600/20 rounded-full blur-3xl translate-x-1/2 pointer-events-none"></div>

      {/* Header Sticky */}
      <div className="sticky top-0 z-10 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md shadow-xl border-b border-white/50 dark:border-gray-800/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/nutrition')}
              className="p-2 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 dark:from-green-400 dark:via-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                Historial de Planes
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {plans.length} {plans.length === 1 ? 'plan creado' : 'planes creados'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-6 space-y-4">
        {plans.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              No tienes planes guardados
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Genera tu primer plan nutricional con IA
            </p>
            <button
              onClick={() => navigate('/diet/generate')}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-bold hover:shadow-lg transition-all"
            >
              Generar Plan
            </button>
          </div>
        ) : (
          plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                'bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-3xl p-6 border shadow-lg hover:shadow-xl transition-all',
                plan.is_active
                  ? 'border-green-500 ring-2 ring-green-500/30'
                  : 'border-gray-200 dark:border-gray-700'
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {plan.name}
                    </h2>
                    {plan.is_active && (
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-bold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Activo
                      </span>
                    )}
                    {plan.generated_by_ai && (
                      <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-bold">
                        🤖 IA
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {plan.description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Objetivo
                    </span>
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {getGoalLabel(plan.goal)}
                  </p>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Calorías
                    </span>
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {plan.target_calories} kcal
                  </p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Creado
                    </span>
                  </div>
                  <p className="text-xs font-bold text-gray-900 dark:text-gray-100">
                    {formatDate(plan.created_at)}
                  </p>
                </div>
              </div>

              {plan.target_protein_g && (
                <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                  <div className="text-center">
                    <span className="text-orange-600 dark:text-orange-400 font-bold">
                      {plan.target_protein_g}g
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 ml-1">
                      Proteína
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-green-600 dark:text-green-400 font-bold">
                      {plan.target_carbs_g}g
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 ml-1">
                      Carbos
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">
                      {plan.target_fat_g}g
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 ml-1">
                      Grasas
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/diet/plan?planId=${plan.id}`)}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Ver Detalle
                </button>
                {!plan.is_active && (
                  <button
                    onClick={() => activatePlan(plan.id)}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Reactivar
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNavbar />
    </div>
  );
};

export default DietHistory;
