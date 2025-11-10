import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RecommendationService } from '../services/recommendation/index.ts';
import type {
  PersonalizedInsights,
  MotivationalContent,
  RecommendationRequest,
} from '../types/recommendation.types.ts';

/**
 * Hook para generar recomendaciones personalizadas
 */
export function useGenerateRecommendations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: RecommendationRequest) =>
      RecommendationService.generateRecommendations(request),
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['insights'] });
    },
  });
}

/**
 * Hook para obtener insights personalizados del usuario
 */
export function usePersonalizedInsights(
  userId: string,
  workoutId?: string,
  dietId?: string,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
) {
  return useQuery<PersonalizedInsights, Error>({
    queryKey: ['insights', userId, workoutId, dietId],
    queryFn: () =>
      RecommendationService.getPersonalizedInsights(userId, workoutId, dietId),
    enabled: options?.enabled ?? !!userId,
    refetchInterval: options?.refetchInterval,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para obtener contenido motivacional
 */
export function useMotivationalContent(
  userId: string,
  context?: string,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
) {
  return useQuery<MotivationalContent, Error>({
    queryKey: ['motivation', userId, context],
    queryFn: () => RecommendationService.getMotivationalContent(userId, context),
    enabled: options?.enabled ?? !!userId,
    refetchInterval: options?.refetchInterval,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

/**
 * Hook combinado para obtener recomendaciones, insights y motivación
 */
export function useProgressDashboard(
  userId: string,
  workoutId?: string,
  dietId?: string
) {
  const insights = usePersonalizedInsights(userId, workoutId, dietId, {
    enabled: !!userId,
  });

  const motivation = useMotivationalContent(userId, undefined, {
    enabled: !!userId,
  });

  const generateRecommendations = useGenerateRecommendations();

  return {
    insights,
    motivation,
    generateRecommendations,
    isLoading: insights.isLoading || motivation.isLoading,
    isError: insights.isError || motivation.isError,
    error: insights.error || motivation.error,
  };
}
