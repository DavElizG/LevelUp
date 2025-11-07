import axios from 'axios';
import type {
  Recommendation,
  PersonalizedInsights,
  MotivationalContent,
  RecommendationRequest,
} from '../../types/recommendation.types';

// Base URL del microservicio de IA
const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:3001/api/ai';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

/**
 * Servicio para manejar recomendaciones y motivación de IA
 */
export class RecommendationService {
  /**
   * Genera recomendaciones personalizadas basadas en el progreso del usuario
   */
  static async generateRecommendations(
    request: RecommendationRequest
  ): Promise<Recommendation[]> {
    try {
      const response = await axios.post<ApiResponse<Recommendation[]>>(
        `${AI_SERVICE_URL}/recommendation`,
        request
      );

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to generate recommendations');
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw error;
    }
  }

  /**
   * Obtiene insights personalizados para el usuario
   */
  static async getPersonalizedInsights(
    userId: string,
    workoutId?: string,
    dietId?: string
  ): Promise<PersonalizedInsights> {
    try {
      const params = new URLSearchParams();
      if (workoutId) params.append('workoutId', workoutId);
      if (dietId) params.append('dietId', dietId);

      const response = await axios.get<ApiResponse<PersonalizedInsights>>(
        `${AI_SERVICE_URL}/recommendation/${userId}/insights?${params.toString()}`
      );

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to get insights');
    } catch (error) {
      console.error('Error fetching insights:', error);
      throw error;
    }
  }

  /**
   * Obtiene contenido motivacional para el usuario
   */
  static async getMotivationalContent(
    userId: string,
    context?: string
  ): Promise<MotivationalContent> {
    try {
      const params = new URLSearchParams();
      if (context) params.append('context', context);

      const response = await axios.get<ApiResponse<MotivationalContent>>(
        `${AI_SERVICE_URL}/recommendation/${userId}/motivation?${params.toString()}`
      );

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to get motivational content');
    } catch (error) {
      console.error('Error fetching motivational content:', error);
      throw error;
    }
  }

  /**
   * Obtiene el icono basado en el tipo de recomendación
   */
  static getRecommendationIcon(type: string): string {
    const icons: Record<string, string> = {
      workout_adjustment: '💪',
      diet_adjustment: '🥗',
      rest_day: '😴',
      hydration: '💧',
      sleep: '🌙',
      general: '💡',
    };
    return icons[type] || '📌';
  }

  /**
   * Obtiene el color basado en la prioridad
   */
  static getPriorityColor(priority: string): {
    bg: string;
    text: string;
    border: string;
  } {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      high: {
        bg: 'bg-red-100 dark:bg-red-900/20',
        text: 'text-red-800 dark:text-red-200',
        border: 'border-red-200 dark:border-red-800',
      },
      medium: {
        bg: 'bg-orange-100 dark:bg-orange-900/20',
        text: 'text-orange-800 dark:text-orange-200',
        border: 'border-orange-200 dark:border-orange-800',
      },
      low: {
        bg: 'bg-blue-100 dark:bg-blue-900/20',
        text: 'text-blue-800 dark:text-blue-200',
        border: 'border-blue-200 dark:border-blue-800',
      },
    };
    return colors[priority] || colors.low;
  }
}
