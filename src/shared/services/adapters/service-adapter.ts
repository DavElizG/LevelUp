import type { 
  AuthService, 
  WorkoutService, 
  DietService,
  ApiResponse,
  User,
  Workout,
  DietPlan,
  Exercise
} from '../../types/index.ts';

import { supabaseAuth } from '../supabase/auth';
import { supabaseWorkoutService, supabaseDietService } from '../supabase/index.ts';
import { aiService } from '../ai/microservice';
import { 
  workoutToCreateData, 
  workoutToUpdateData, 
  workoutRoutineToWorkout, 
  workoutRoutinesToWorkouts,
  calculateTotalCalories 
} from '../../utils/type-converters.ts';

/**
 * Service Adapter that unifies Supabase and AI microservice
 * - Authentication: Supabase Auth
 * - CRUD Operations: Supabase Database  
 * - AI Generation: AI Microservice
 */
export class ServiceAdapter {
  // Auth service (Supabase)
  public readonly auth: AuthService = supabaseAuth;
  
  // Workout service (Supabase CRUD)
  public readonly workout: WorkoutService = supabaseWorkoutService;
  
  // Diet service (Supabase CRUD)  
  public readonly diet: DietService = supabaseDietService;

  // AI service (Microservice)
  public readonly ai = aiService;

  /**
   * Hybrid methods that combine CRUD operations with AI generation
   */

  // Generate AI workout and save to Supabase
  async generateAndSaveWorkout(preferences: {
    userId: string;
    goal: string;
    level: string;
    duration: number;
    equipment: string[];
    daysPerWeek?: number;
    muscleGroups?: string[];
    workoutType?: string;
  }): Promise<ApiResponse<Workout>> {
    try {
      // Generate workout with AI - map to the expected format
      const aiResponse = await this.ai.generateWorkout({
        userId: preferences.userId,
        goal: preferences.goal,
        difficulty: preferences.level,
        daysPerWeek: preferences.daysPerWeek || 3,
        duration: preferences.duration,
        equipment: preferences.equipment,
        targetMuscles: preferences.muscleGroups,
        preferences: preferences.workoutType,
      });
      
      if (!aiResponse.success || !aiResponse.data) {
        return aiResponse;
      }

      // Save to Supabase
      const createData = workoutToCreateData(aiResponse.data);
      const saveResponse = await this.workout.createWorkout(createData);
      
      if (!saveResponse.success || !saveResponse.data) {
        return {
          success: false,
          data: null,
          error: saveResponse.error || 'Failed to save workout',
        };
      }
      
      // Convert back to Workout format
      const workoutResult = workoutRoutineToWorkout(saveResponse.data);
      return {
        success: true,
        data: workoutResult,
        message: saveResponse.message,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to generate and save workout',
      };
    }
  }

  // Generate AI diet plan and save to Supabase
  async generateAndSaveDietPlan(preferences: {
    userId: string;
    goal: string;
    calories: number;
    restrictions: string[];
    meals: number;
    dietType?: string;
    allergies?: string[];
  }): Promise<ApiResponse<DietPlan>> {
    try {
      // Generate diet plan with AI - map to the expected format
      // IMPORTANTE: Solo enviamos los campos que el backend espera y validamos tipos
      const aiRequest: {
        userId: string;
        goal: string;
        calories: number;
        restrictions?: string[];
        mealsPerDay?: number;
        avoidFoods?: string[];
        preferences?: string;
      } = {
        userId: preferences.userId,
        goal: preferences.goal,
        calories: Number(preferences.calories), // Asegurar que sea número
      };
      
      // Solo agregar campos opcionales si tienen valor válido
      if (preferences.restrictions && Array.isArray(preferences.restrictions) && preferences.restrictions.length > 0) {
        aiRequest.restrictions = preferences.restrictions;
      }
      if (preferences.meals && typeof preferences.meals === 'number') {
        aiRequest.mealsPerDay = preferences.meals;
      }
      if (preferences.allergies && Array.isArray(preferences.allergies) && preferences.allergies.length > 0) {
        aiRequest.avoidFoods = preferences.allergies;
      }
      if (preferences.dietType && typeof preferences.dietType === 'string' && preferences.dietType.trim()) {
        aiRequest.preferences = preferences.dietType;
      }
      
      // NUNCA enviar targetProtein a menos que esté explícitamente definido
      // (actualmente no se captura en el frontend)
      
      // Debug: ver qué estamos enviando a la API
      console.log('🚀 Petición a AI API:', JSON.stringify(aiRequest, null, 2));
      
      const aiResponse = await this.ai.generateDietPlan(aiRequest);
      
      if (!aiResponse.success || !aiResponse.data) {
        return aiResponse;
      }

      // El backend ya guardó el plan en Supabase, solo devolvemos la respuesta
      return aiResponse;
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to generate and save diet plan',
      };
    }
  }

  // Optimize existing workout with AI and update in Supabase
  async optimizeAndUpdateWorkout(workoutId: string, feedback: {
    difficulty: 'too_easy' | 'just_right' | 'too_hard';
    timeAvailable: number;
    equipment: string[];
  }): Promise<ApiResponse<Workout>> {
    try {
      // Get AI optimization
      const aiResponse = await this.ai.optimizeWorkout(workoutId, feedback);
      if (!aiResponse.success || !aiResponse.data) {
        return aiResponse;
      }

      // Update in Supabase
      const updateData = workoutToUpdateData(aiResponse.data);
      const updateResponse = await this.workout.updateWorkout(workoutId, updateData);
      
      if (!updateResponse.success || !updateResponse.data) {
        return {
          success: false,
          data: null,
          error: updateResponse.error || 'Failed to update workout',
        };
      }
      
      // Convert back to Workout format
      const workoutResult = workoutRoutineToWorkout(updateResponse.data);
      return {
        success: true,
        data: workoutResult,
        message: updateResponse.message,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to optimize and update workout',
      };
    }
  }
  
  // Get user profile with workout/diet stats
  async getUserProfile(): Promise<ApiResponse<User & { 
    totalWorkouts: number; 
    currentDietPlan?: DietPlan;
    favoriteExercises: Exercise[];
  }>> {
    try {
      // Get user from Supabase
      const userResponse = await this.auth.getCurrentUser();
      if (!userResponse.success || !userResponse.data) {
        return {
          success: false,
          data: null,
          error: userResponse.error || 'Failed to get user',
        };
      }

      // Get workout stats from backend
      const workoutsResponse = await this.workout.getWorkouts();
      const exercisesResponse = await this.workout.getExercises();
      
      // Get diet plans from backend
      const dietPlansResponse = await this.diet.getDietPlans();

      const totalWorkouts = workoutsResponse.success ? workoutsResponse.data?.length || 0 : 0;
      const currentDietPlan = dietPlansResponse.success && dietPlansResponse.data?.length 
        ? dietPlansResponse.data[0] 
        : undefined;
      const favoriteExercises = exercisesResponse.success 
        ? exercisesResponse.data?.slice(0, 3) || []
        : [];

      return {
        success: true,
        data: {
          ...userResponse.data,
          totalWorkouts,
          currentDietPlan,
          favoriteExercises,
        },
        message: 'User profile retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to get user profile',
      };
    }
  }

  // Initialize user data after registration
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async initializeUserData(_userId: string): Promise<ApiResponse<void>> {
    try {
      // Could create default workout/diet preferences in backend
      // This is where you'd sync user data between Supabase and backend
      
      return {
        success: true,
        data: null,
        message: 'User data initialized successfully',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to initialize user data',
      };
    }
  }

  // Get dashboard data combining multiple services
  async getDashboardData(): Promise<ApiResponse<{
    user: User;
    recentWorkouts: Workout[];
    currentDietPlan?: DietPlan;
    todayCalories: number;
  }>> {
    try {
      const [userResponse, workoutsResponse, dietPlansResponse] = await Promise.all([
        this.auth.getCurrentUser(),
        this.workout.getWorkouts(),
        this.diet.getDietPlans(),
      ]);

      if (!userResponse.success || !userResponse.data) {
        return {
          success: false,
          data: null,
          error: 'Failed to get user data',
        };
      }

      const recentWorkouts = workoutsResponse.success 
        ? workoutsResponse.data?.slice(0, 5) || []
        : [];
        
      const currentDietPlan = dietPlansResponse.success && dietPlansResponse.data?.length
        ? dietPlansResponse.data[0]
        : undefined;

      const todayCalories = currentDietPlan ? calculateTotalCalories(currentDietPlan) : 0;
      const convertedWorkouts = workoutRoutinesToWorkouts(recentWorkouts);

      return {
        success: true,
        data: {
          user: userResponse.data,
          recentWorkouts: convertedWorkouts,
          currentDietPlan,
          todayCalories,
        },
        message: 'Dashboard data retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to get dashboard data',
      };
    }
  }
}

// Export singleton instance
export const serviceAdapter = new ServiceAdapter();

// Re-export individual services for direct access if needed
export { supabaseAuth as authService };
export { supabaseWorkoutService as workoutService };  
export { supabaseDietService as dietService };
export { aiService };