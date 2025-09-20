import { supabase } from './auth';
import type { 
  WorkoutService,
  ApiResponse, 
  WorkoutRoutine,
  Exercise,
  CreateWorkoutData,
  UpdateWorkoutData
} from '../../types/index.ts';

/**
 * Supabase Workout Service - Handles CRUD operations for workout routines
 */
export class SupabaseWorkoutService implements WorkoutService {
  async getWorkouts(): Promise<ApiResponse<WorkoutRoutine[]>> {
    try {
      const { data, error } = await supabase
        .from('workout_routines')
        .select(`
          *,
          exercises:routine_exercises(
            *,
            exercise:exercises(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        return {
          success: false,
          data: null,
          error: error.message,
        };
      }

      return {
        success: true,
        data: data || [],
        message: 'Workout routines retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch workout routines',
      };
    }
  }

  async getWorkout(id: string): Promise<ApiResponse<WorkoutRoutine>> {
    try {
      const { data, error } = await supabase
        .from('workout_routines')
        .select(`
          *,
          exercises:routine_exercises(
            *,
            exercise:exercises(*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        return {
          success: false,
          data: null,
          error: error.message,
        };
      }

      return {
        success: true,
        data: data,
        message: 'Workout routine retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch workout routine',
      };
    }
  }

  async createWorkout(workout: CreateWorkoutData): Promise<ApiResponse<WorkoutRoutine>> {
    try {
      // Insert workout routine first
      const { data: routineData, error: routineError } = await supabase
        .from('workout_routines')
        .insert({
          user_id: workout.userId,
          name: workout.name,
          description: workout.description,
          goal: workout.goal,
          difficulty_level: workout.difficultyLevel,
          duration_weeks: workout.durationWeeks,
          days_per_week: workout.daysPerWeek,
          generated_by_ai: workout.generatedByAi,
          ai_prompt: workout.aiPrompt,
          ai_model: workout.aiModel,
          is_active: workout.isActive,
        })
        .select()
        .single();

      if (routineError) {
        return {
          success: false,
          data: null,
          error: routineError.message,
        };
      }

      // Insert routine exercises if provided
      if (workout.exercises && workout.exercises.length > 0) {
        const exercisesToInsert = workout.exercises.map(exercise => ({
          routine_id: routineData.id,
          exercise_id: exercise.exerciseId,
          day_of_week: exercise.dayOfWeek,
          order_in_day: exercise.orderInDay,
          sets: exercise.sets,
          reps_min: exercise.repsMin,
          reps_max: exercise.repsMax,
          rest_seconds: exercise.restSeconds,
          weight_kg: exercise.weightKg,
          notes: exercise.notes,
        }));

        const { error: exercisesError } = await supabase
          .from('routine_exercises')
          .insert(exercisesToInsert);

        if (exercisesError) {
          // Rollback workout routine if exercises failed
          await supabase.from('workout_routines').delete().eq('id', routineData.id);
          return {
            success: false,
            data: null,
            error: exercisesError.message,
          };
        }
      }

      // Fetch complete workout with exercises
      const completeWorkout = await this.getWorkout(routineData.id);
      return completeWorkout;
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to create workout routine',
      };
    }
  }

  async updateWorkout(id: string, workout: UpdateWorkoutData): Promise<ApiResponse<WorkoutRoutine>> {
    try {
      const { error } = await supabase
        .from('workout_routines')
        .update({
          name: workout.name,
          description: workout.description,
          goal: workout.goal,
          difficulty_level: workout.difficultyLevel,
          duration_weeks: workout.durationWeeks,
          days_per_week: workout.daysPerWeek,
          is_active: workout.isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        return {
          success: false,
          data: null,
          error: error.message,
        };
      }

      // Fetch updated workout
      const updatedWorkout = await this.getWorkout(id);
      return updatedWorkout;
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to update workout routine',
      };
    }
  }

  async deleteWorkout(id: string): Promise<ApiResponse<void>> {
    try {
      // Delete routine exercises first (cascade should handle this, but being explicit)
      await supabase.from('routine_exercises').delete().eq('routine_id', id);
      
      // Delete workout routine
      const { error } = await supabase
        .from('workout_routines')
        .delete()
        .eq('id', id);

      if (error) {
        return {
          success: false,
          data: null,
          error: error.message,
        };
      }

      return {
        success: true,
        data: null,
        message: 'Workout routine deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to delete workout routine',
      };
    }
  }

  async generateAIWorkout(_preferences: any): Promise<ApiResponse<WorkoutRoutine>> {
    // This method will call the AI microservice
    // For now, return a placeholder response
    return {
      success: false,
      data: null,
      error: 'AI workout generation not implemented yet - requires AI microservice integration',
    };
  }

  async getExercises(): Promise<ApiResponse<Exercise[]>> {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name');

      if (error) {
        return {
          success: false,
          data: null,
          error: error.message,
        };
      }

      return {
        success: true,
        data: data || [],
        message: 'Exercises retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch exercises',
      };
    }
  }
}

// Export instance
export const supabaseWorkoutService = new SupabaseWorkoutService();