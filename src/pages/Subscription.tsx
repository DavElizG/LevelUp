import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Crown, Zap, Check, Sparkles, TrendingUp, Dumbbell, Apple, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Types
type SubscriptionPlan = 'free' | 'pro' | 'premium';

interface UserSubscription {
  plan: SubscriptionPlan;
  status: 'active' | 'cancelled' | 'expired';
  workout_limit: number;
  diet_limit: number;
  workout_used: number;
  diet_used: number;
  started_at: string;
  expires_at: string | null;
}

interface SubscriptionPlanDetails {
  plan: SubscriptionPlan;
  workout_limit: number;
  diet_limit: number;
  price: number;
  features: string[];
}

// Service functions
const getUserSubscription = async (): Promise<UserSubscription | null> => {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('get_user_subscription').single();
  if (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }
  return data as UserSubscription;
};

const getAvailablePlans = async (): Promise<SubscriptionPlanDetails[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc('get_available_plans');
  if (error) {
    console.error('Error fetching plans:', error);
    throw error;
  }
  return data as SubscriptionPlanDetails[];
};

const updateSubscription = async (newPlan: SubscriptionPlan): Promise<void> => {
  if (!supabase) throw new Error('Supabase not initialized');
  const { error } = await supabase.rpc('update_user_subscription', {
    new_plan: newPlan,
  });
  if (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
};

const calculateUsagePercentage = (used: number, limit: number): number => {
  if (limit === -1) return 0;
  if (limit === 0) return 100;
  return Math.min(Math.round((used / limit) * 100), 100);
};

const isUpgrade = (currentPlan: SubscriptionPlan, newPlan: SubscriptionPlan): boolean => {
  const planOrder: Record<SubscriptionPlan, number> = {
    free: 0,
    pro: 1,
    premium: 2,
  };
  return planOrder[newPlan] > planOrder[currentPlan];
};

export default function SubscriptionPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  // Obtener suscripción actual
  const { data: subscription, isLoading: loadingSubscription } = useQuery({
    queryKey: ['user-subscription'],
    queryFn: getUserSubscription,
  });

  // Obtener planes disponibles
  const { data: plans = [], isLoading: loadingPlans } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: getAvailablePlans,
  });

  // Mutación para actualizar suscripción
  const updateMutation = useMutation({
    mutationFn: updateSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
      setSelectedPlan(null);
    },
  });

  const handleUpgrade = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    // Simular proceso de pago
    setTimeout(() => {
      updateMutation.mutate(plan);
    }, 1000);
  };

  const getPlanIcon = (plan: SubscriptionPlan) => {
    switch (plan) {
      case 'free':
        return <Zap className="w-8 h-8" />;
      case 'pro':
        return <TrendingUp className="w-8 h-8" />;
      case 'premium':
        return <Crown className="w-8 h-8" />;
    }
  };

  if (loadingSubscription || loadingPlans) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const currentPlan = subscription?.plan || 'free';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <span className="font-medium">Volver</span>
        </button>

        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Elige tu Plan
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Desbloquea todo el potencial de LevelUp y alcanza tus metas fitness
          </p>
        </div>

        {/* Current Usage - Mobile Optimized */}
        {subscription && (
          <div className="max-w-4xl mx-auto mb-8 sm:mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                Tu uso este mes
              </h3>
              
              <div className="space-y-4">
                {/* Workout Tokens */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Rutinas
                      </span>
                    </div>
                    <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                      {subscription.workout_used} / {subscription.workout_limit === -1 ? '∞' : subscription.workout_limit}
                    </span>
                  </div>
                  <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${calculateUsagePercentage(subscription.workout_used, subscription.workout_limit)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Diet Tokens */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Apple className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Planes de dieta
                      </span>
                    </div>
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">
                      {subscription.diet_used} / {subscription.diet_limit === -1 ? '∞' : subscription.diet_limit}
                    </span>
                  </div>
                  <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${calculateUsagePercentage(subscription.diet_used, subscription.diet_limit)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Plans Grid - Mobile First */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {plans.map((plan: SubscriptionPlanDetails) => {
            const isCurrentPlan = plan.plan === currentPlan;
            const planIsUpgrade = isUpgrade(currentPlan, plan.plan);
            const isPro = plan.plan === 'pro';
            
            // Definir colores por plan (similar a Dashboard)
            const planColors = {
              free: {
                border: 'border-gray-200 dark:border-gray-700 high-contrast:border-gray-600',
                gradient: 'from-gray-100 to-gray-50 dark:from-gray-900/30 dark:to-gray-800/20 high-contrast:from-gray-900/50 high-contrast:to-gray-800/30',
                iconBg: 'bg-gradient-to-br from-gray-400 to-gray-600',
                accentColor: 'text-gray-600 dark:text-gray-400'
              },
              pro: {
                border: 'border-blue-200 dark:border-blue-900 high-contrast:border-blue-600',
                gradient: 'from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 high-contrast:from-blue-900/50 high-contrast:to-blue-800/30',
                iconBg: 'bg-gradient-to-br from-blue-400 to-blue-600',
                accentColor: 'text-blue-600 dark:text-blue-400'
              },
              premium: {
                border: 'border-orange-200 dark:border-orange-900 high-contrast:border-orange-600',
                gradient: 'from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-800/20 high-contrast:from-orange-900/50 high-contrast:to-orange-800/30',
                iconBg: 'bg-gradient-to-br from-orange-400 to-orange-600',
                accentColor: 'text-orange-600 dark:text-orange-400'
              }
            };

            const colors = planColors[plan.plan];

            return (
              <div
                key={plan.plan}
                className={`
                  relative flex flex-col
                  rounded-2xl shadow-lg
                  bg-white dark:bg-gray-800 high-contrast:bg-black
                  border-2 ${isCurrentPlan ? 'border-orange-500 dark:border-orange-500 high-contrast:border-orange-600' : colors.border}
                  transition-all duration-300
                  hover:shadow-xl hover:-translate-y-1
                  ${isPro ? 'sm:scale-105 sm:shadow-xl' : ''}
                  overflow-hidden group
                  ${isCurrentPlan ? 'animate-pulse-slow' : ''}
                `}
              >
                {/* Decorative gradient blob - constrained within card */}
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colors.gradient} rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-500 pointer-events-none`}></div>
                
                {/* Badge Más Popular */}
                {isPro && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg animate-bounce-slow">
                      <Sparkles className="w-3 h-3" />
                      Más Popular
                    </span>
                  </div>
                )}

                {/* Badge Activo */}
                {isCurrentPlan && (
                  <div className="absolute -top-3 right-4 z-10">
                    <span className="inline-flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                      <Check className="w-3 h-3" />
                      Activo
                    </span>
                  </div>
                )}

                <div className="relative z-10 flex flex-col p-5 sm:p-6 flex-grow">
                  {/* Icon & Title */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`inline-flex p-2.5 rounded-xl ${colors.iconBg} text-white shadow-md group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                      {getPlanIcon(plan.plan)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white high-contrast:text-white capitalize truncate">
                        {plan.plan === 'free' ? 'Gratis' : plan.plan === 'pro' ? 'Pro' : 'Premium'}
                      </h3>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white high-contrast:text-white">
                        ${plan.price.toFixed(0)}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-gray-600 dark:text-gray-400 high-contrast:text-gray-300 text-sm">/mes</span>
                      )}
                    </div>
                  </div>

                  {/* Tokens Info */}
                  <div className={`mb-4 p-3 rounded-xl space-y-2 backdrop-blur-sm border ${colors.border} bg-white/50 dark:bg-gray-900/50 high-contrast:bg-black/50`}>
                    <div className="flex items-center justify-between text-sm gap-2">
                      <span className="text-gray-600 dark:text-gray-400 high-contrast:text-gray-300 flex items-center gap-2 flex-shrink-0">
                        <Dumbbell className="w-4 h-4" />
                        Rutinas
                      </span>
                      <span className={`font-semibold ${colors.accentColor} text-right`}>
                        {plan.workout_limit === -1 ? 'Ilimitadas' : `${plan.workout_limit}/mes`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm gap-2">
                      <span className="text-gray-600 dark:text-gray-400 high-contrast:text-gray-300 flex items-center gap-2 flex-shrink-0">
                        <Apple className="w-4 h-4" />
                        Planes dieta
                      </span>
                      <span className={`font-semibold ${colors.accentColor} text-right`}>
                        {plan.diet_limit === -1 ? 'Ilimitados' : `${plan.diet_limit}/mes`}
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5 mb-6 flex-grow">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 dark:text-green-400 high-contrast:text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 high-contrast:text-gray-200 leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => !isCurrentPlan && handleUpgrade(plan.plan)}
                    disabled={isCurrentPlan || updateMutation.isPending}
                    className={`
                      w-full py-3 px-4 rounded-xl font-semibold text-sm
                      transition-all duration-300 shadow-md
                      ${
                        isCurrentPlan
                          ? 'bg-gray-200 dark:bg-gray-700 high-contrast:bg-gray-800 text-gray-500 dark:text-gray-400 high-contrast:text-gray-400 cursor-not-allowed'
                          : planIsUpgrade
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white hover:shadow-lg transform hover:scale-[1.02] active:scale-95'
                          : 'bg-gray-100 dark:bg-gray-700 high-contrast:bg-gray-800 text-gray-700 dark:text-gray-300 high-contrast:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 high-contrast:hover:bg-gray-700'
                      }
                    `}
                  >
                    {updateMutation.isPending && selectedPlan === plan.plan ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Procesando...
                      </span>
                    ) : isCurrentPlan ? (
                      'Plan Actual'
                    ) : planIsUpgrade ? (
                      `Mejorar a ${plan.plan === 'pro' ? 'Pro' : 'Premium'}`
                    ) : (
                      'Seleccionar'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Demo Notice */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Modo Demostración</h4>
                <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                  Este es un sistema de suscripciones de demostración. Los "pagos" se aprueban automáticamente para fines de prueba. En producción, esto estaría integrado con procesadores de pago reales como Stripe.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
