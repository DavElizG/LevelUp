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
    goal: string;
    level: string;
    duration: number;
    equipment: string[];
    muscleGroups?: string[];
    workoutType?: string;
  }): Promise<ApiResponse<Workout>> {
    try {
      // Generate workout with AI
      const aiResponse = await this.ai.generateWorkout(preferences);
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
    goal: string;
    calories: number;
    restrictions: string[];
    meals: number;
    dietType?: string;
    allergies?: string[];
  }): Promise<ApiResponse<DietPlan>> {
    try {
      // Generate diet plan with AI
      const aiResponse = await this.ai.generateDietPlan(preferences);
      if (!aiResponse.success || !aiResponse.data) {
        return aiResponse;
      }

      // Save to Supabase
      const saveResponse = await this.diet.createDietPlan(aiResponse.data);
      return saveResponse;
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
        return userResponse as any;
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