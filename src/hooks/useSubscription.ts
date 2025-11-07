import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SubscriptionService } from '../services/subscription/index.ts';
import type { SubscriptionPlan } from '../types/subscription.types.ts';

/**
 * Hook para manejar la suscripción del usuario
 */
export function useSubscription() {
  const queryClient = useQueryClient();

  const subscription = useQuery({
    queryKey: ['user-subscription'],
    queryFn: () => SubscriptionService.getUserSubscription(),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const plans = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => SubscriptionService.getAvailablePlans(),
    staleTime: 1000 * 60 * 30, // 30 minutos
  });

  const updatePlan = useMutation({
    mutationFn: (newPlan: SubscriptionPlan) => SubscriptionService.updateSubscription(newPlan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
    },
  });

  return {
    subscription: subscription.data,
    isLoading: subscription.isLoading,
    plans: plans.data || [],
    updatePlan: updatePlan.mutate,
    isUpdating: updatePlan.isPending,
  };
}

/**
 * Hook para verificar límites antes de generar
 */
export function useGenerationLimit(type: 'workout' | 'diet') {
  const { data: canGenerate, isLoading } = useQuery({
    queryKey: ['can-generate', type],
    queryFn: () => SubscriptionService.canGenerate(type),
    staleTime: 1000 * 60, // 1 minuto
  });

  return {
    canGenerate: canGenerate ?? true,
    isChecking: isLoading,
  };
}

/**
 * Hook para incrementar uso después de generación exitosa
 */
export function useIncrementTokens() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (type: 'workout' | 'diet') => SubscriptionService.incrementTokenUsage(type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
      queryClient.invalidateQueries({ queryKey: ['can-generate'] });
    },
  });
}
