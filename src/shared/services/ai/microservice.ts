import type { ApiResponse, Workout, DietPlan } from '../../types/index.ts';
import { HttpClient } from '../api/http-client';
import { config } from '../../../app/config/env';

// Create HTTP client instance for AI microservice
const aiClient = new HttpClient(config.ai.baseUrl, config.ai.apiKey);

/**
 * AI Microservice - Handles AI-powered content generation
 * Responsibilities:
 * - Generate workout routines using AI
 * - Generate diet plans using AI
 * - Provide AI recommendations and suggestions
 */
export class AIService {
  /**
   * Generate AI-powered workout routine
   */
  async generateWorkout(preferences: {
    userId: string;
    goal: string;
    difficulty: string;
    daysPerWeek: number;
    duration: number;
    equipment?: string[];
    targetMuscles?: string[];
    preferences?: string;
  }): Promise<ApiResponse<Workout>> {
    try {
      const response = await aiClient.post<Workout>('/workout', preferences);
      return response;
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to generate AI workout',
      };
    }
  }

  /**
   * Generate AI-powered diet plan
   */
  async generateDietPlan(preferences: {
    userId: string;
    goal: string;
    calories: number;
    restrictions?: string[];
    mealsPerDay?: number;
    preferredFoods?: string[];
    avoidFoods?: string[];
    preferences?: string;
  }): Promise<ApiResponse<DietPlan>> {
    try {
      const response = await aiClient.post<DietPlan>('/diet', preferences);
      return response;
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to generate AI diet plan',
      };
    }
  }

  /**
   * Get AI recommendations for user
   */
  async getRecommendations(userProfile: {
    goals: string[];
    currentLevel: string;
    preferences: Record<string, unknown>;
  }): Promise<ApiResponse<{
    workoutRecommendations: string[];
    dietRecommendations: string[];
    tips: string[];
  }>> {
    try {
      const response = await aiClient.post<{
        workoutRecommendations: string[];
        dietRecommendations: string[];
        tips: string[];
      }>('/recommendations', userProfile);
      return response;
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to get AI recommendations',
      };
    }
  }

  /**
   * Optimize existing workout with AI
   */
  async optimizeWorkout(workoutId: string, feedback: {
    difficulty: 'too_easy' | 'just_right' | 'too_hard';
    timeAvailable: number;
    equipment: string[];
  }): Promise<ApiResponse<Workout>> {
    try {
      const response = await aiClient.post<Workout>(`/workouts/${workoutId}/optimize`, feedback);
      return response;
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to optimize workout',
      };
    }
  }

  /**
   * Adjust diet plan with AI
   */
  async adjustDietPlan(dietPlanId: string, adjustments: {
    calorieChange: number;
    newRestrictions?: string[];
    preferredMeals?: string[];
  }): Promise<ApiResponse<DietPlan>> {
    try {
      const response = await aiClient.post<DietPlan>(`/diet-plans/${dietPlanId}/adjust`, adjustments);
      return response;
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to adjust diet plan',
      };
    }
  }

  /**
   * Get AI analysis of user progress
   */
  async analyzeProgress(progressData: {
    workouts: Record<string, unknown>[];
    measurements: Record<string, unknown>[];
    goals: string[];
    timeframe: string;
  }): Promise<ApiResponse<{
    insights: string[];
    recommendations: string[];
    nextSteps: string[];
    motivationalMessage: string;
  }>> {
    try {
      const response = await aiClient.post<{
        insights: string[];
        recommendations: string[];
        nextSteps: string[];
        motivationalMessage: string;
      }>('/analysis/progress', progressData);
      return response;
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to analyze progress',
      };
    }
  }
}

// Export configured AI service
export const aiService = new AIService();