import { supabase } from '../../../lib/supabase';
import type {
  WorkoutService,
  WorkoutRoutine,
  Exercise,
  CreateWorkoutData,
  ExerciseSearchFilters,
  ApiResponse,
  WorkoutSession,
  CreateExerciseLogData,
  WorkoutExerciseLog
} from '../../../shared/types/index';

// Check if Supabase is properly configured
const isSupabaseConfigured = !!supabase;

// Mock data for development/fallback
const mockRoutines: WorkoutRoutine[] = [
  // Add mock data if needed
];

export const workoutService: WorkoutService = {
  async getWorkouts(): Promise<ApiResponse<WorkoutRoutine[]>> {
    if (!isSupabaseConfigured || !supabase) {
      return { 
        success: true, 
        data: mockRoutines, 
        error: null,
        message: 'Mock data loaded successfully'
      };
    }

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

    return { 
      success: !error, 
      data: data as WorkoutRoutine[] || [], 
      error,
      message: error ? 'Failed to fetch workouts' : 'Workouts fetched successfully'
    };
  },

  async getWorkout(id: string): Promise<ApiResponse<WorkoutRoutine>> {
    if (!isSupabaseConfigured || !supabase) {
      return { 
        success: true, 
        data: mockRoutines[0] || null, 
        error: null,
        message: 'Mock workout loaded successfully'
      };
    }

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

    return { 
      success: !error, 
      data: data as WorkoutRoutine || null, 
      error,
      message: error ? 'Failed to fetch workout' : 'Workout fetched successfully'
    };
  },

  async createWorkout(workout: CreateWorkoutData): Promise<ApiResponse<WorkoutRoutine>> {
    if (!isSupabaseConfigured || !supabase) {
      return { 
        success: true, 
        data: mockRoutines[0] || null, 
        error: null,
        message: 'Mock workout created successfully'
      };
    }

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { 
        success: false,
        data: null, 
        error: new Error('Usuario no autenticado. Por favor inicia sesión.'),
        message: 'Authentication required'
      };
    }

    // Insert the routine first
    const routinePayload = {
      user_id: user.id,
      name: workout.name,
      description: workout.description ?? null,
      goal: workout.goal ?? null,
      difficulty_level: workout.difficultyLevel ?? null,
      duration_weeks: workout.durationWeeks ?? null,
      days_per_week: workout.daysPerWeek ?? null,
      generated_by_ai: workout.generatedByAi ?? false,
      ai_prompt: workout.aiPrompt ?? null,
      ai_model: workout.aiModel ?? null,
      is_active: workout.isActive ?? true,
      is_public: workout.isPublic ?? false,
    };

    const { data: routineData, error: routineError } = await supabase
      .from('workout_routines')
      .insert(routinePayload)
      .select()
      .single();

    if (routineError) {
      return { 
        success: false, 
        data: null, 
        error: routineError,
        message: 'Failed to create workout routine'
      };
    }

    // Insert routine_exercises if any
    if (workout.exercises && workout.exercises.length > 0) {
      const exercisesToInsert = workout.exercises.map((ex) => ({
        routine_id: routineData.id,
        exercise_id: ex.exerciseId,
        day_of_week: ex.dayOfWeek ?? 1,
        order_in_day: ex.orderInDay ?? 1,
        sets: ex.sets ?? 3,
        reps_min: ex.repsMin ?? null,
        reps_max: ex.repsMax ?? null,
        rest_seconds: ex.restSeconds ?? null,
        weight_kg: ex.weightKg ?? null,
        notes: ex.notes ?? null,
      }));

      const { error: exercisesError } = await supabase
        .from('routine_exercises')
        .insert(exercisesToInsert);

      if (exercisesError) {
        // rollback
        await supabase.from('workout_routines').delete().eq('id', routineData.id);
        return { 
          success: false, 
          data: null, 
          error: exercisesError,
          message: 'Failed to add exercises to routine'
        };
      }
    }

    // Fetch the created routine with its exercises
    const { data, error } = await supabase
      .from('workout_routines')
      .select(`
        *,
        exercises:routine_exercises(
          *,
          exercise:exercises(*)
        )
      `)
      .eq('id', routineData.id)
      .single();

    return { 
      success: !error, 
      data: data as WorkoutRoutine || null, 
      error,
      message: error ? 'Failed to fetch created routine' : 'Workout created successfully'
    };
  },

  async updateWorkout(id: string, workout: Partial<CreateWorkoutData>): Promise<ApiResponse<WorkoutRoutine>> {
    if (!isSupabaseConfigured || !supabase) {
      return { 
        success: true, 
        data: mockRoutines[0] || null, 
        error: null,
        message: 'Mock workout updated successfully'
      };
    }

    const { data, error } = await supabase
      .from('workout_routines')
      .update(workout)
      .eq('id', id)
      .select(`
        *,
        exercises:routine_exercises(
          *,
          exercise:exercises(*)
        )
      `)
      .single();

    return { 
      success: !error, 
      data: data as WorkoutRoutine || null, 
      error,
      message: error ? 'Failed to update workout' : 'Workout updated successfully'
    };
  },

  async deleteWorkout(id: string): Promise<ApiResponse<void>> {
    if (!isSupabaseConfigured || !supabase) {
      return { 
        success: true, 
        data: null, 
        error: null,
        message: 'Mock workout deleted successfully'
      };
    }

    const { error } = await supabase
      .from('workout_routines')
      .delete()
      .eq('id', id);

    return { 
      success: !error, 
      data: null, 
      error,
      message: error ? 'Failed to delete workout' : 'Workout deleted successfully'
    };
  },

  async generateAIWorkout(_preferences: Record<string, unknown>): Promise<ApiResponse<WorkoutRoutine>> {
    // Mock implementation for AI generation
    return { 
      success: true, 
      data: mockRoutines[0] || null, 
      error: null,
      message: 'AI workout generated successfully (mock)'
    };
  },

  async getExercises(): Promise<ApiResponse<Exercise[]>> {
    if (!isSupabaseConfigured || !supabase) {
      return { 
        success: true, 
        data: [], 
        error: null,
        message: 'Mock exercises loaded successfully'
      };
    }

    const { data, error } = await supabase
      .from('exercises')
      .select('*');

    return { 
      success: !error, 
      data: data as Exercise[] || [], 
      error,
      message: error ? 'Failed to fetch exercises' : 'Exercises fetched successfully'
    };
  },

  async searchExercises(filters: ExerciseSearchFilters): Promise<ApiResponse<Exercise[]>> {
    if (!isSupabaseConfigured || !supabase) {
      return { 
        success: true, 
        data: [], 
        error: null,
        message: 'Mock exercise search completed'
      };
    }

    let query = supabase.from('exercises').select('*');

    if (filters.muscleGroup) {
      query = query.eq('muscle_group', filters.muscleGroup);
    }
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.difficulty) {
      query = query.eq('difficulty', filters.difficulty);
    }
    if (filters.query) {
      query = query.ilike('name', `%${filters.query}%`);
    }
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    return { 
      success: !error, 
      data: data as Exercise[] || [], 
      error,
      message: error ? 'Failed to search exercises' : 'Exercise search completed successfully'
    };
  },

  async startWorkoutSession(routineId: string): Promise<ApiResponse<WorkoutSession>> {
    if (!isSupabaseConfigured || !supabase) {
      return { 
        success: false, 
        data: null, 
        error: new Error('Supabase not configured'),
        message: 'Cannot start workout session'
      };
    }

    const { data, error } = await supabase
      .from('workout_sessions')
      .insert({
        workout_routine_id: routineId,
        start_time: new Date().toISOString(),
        status: 'active'
      })
      .select()
      .single();

    return { 
      success: !error, 
      data: data as WorkoutSession || null, 
      error,
      message: error ? 'Failed to start workout session' : 'Workout session started successfully'
    };
  },

  async endWorkoutSession(sessionId: string, rating?: number, notes?: string): Promise<ApiResponse<WorkoutSession>> {
    if (!isSupabaseConfigured || !supabase) {
      return { 
        success: false, 
        data: null, 
        error: new Error('Supabase not configured'),
        message: 'Cannot end workout session'
      };
    }

    const { data, error } = await supabase
      .from('workout_sessions')
      .update({
        end_time: new Date().toISOString(),
        status: 'completed',
        rating,
        notes
      })
      .eq('id', sessionId)
      .select()
      .single();

    return { 
      success: !error, 
      data: data as WorkoutSession || null, 
      error,
      message: error ? 'Failed to end workout session' : 'Workout session ended successfully'
    };
  },

  async logExercise(sessionId: string, exerciseLog: CreateExerciseLogData): Promise<ApiResponse<WorkoutExerciseLog>> {
    if (!isSupabaseConfigured || !supabase) {
      return { 
        success: false, 
        data: null, 
        error: new Error('Supabase not configured'),
        message: 'Cannot log exercise'
      };
    }

    const { data, error } = await supabase
      .from('workout_exercise_logs')
      .insert({
        workout_session_id: sessionId,
        ...exerciseLog
      })
      .select()
      .single();

    return { 
      success: !error, 
      data: data as WorkoutExerciseLog || null, 
      error,
      message: error ? 'Failed to log exercise' : 'Exercise logged successfully'
    };
  },

  async getWorkoutSessions(routineId?: string): Promise<ApiResponse<WorkoutSession[]>> {
    if (!isSupabaseConfigured || !supabase) {
      return { 
        success: false, 
        data: [], 
        error: new Error('Supabase not configured'),
        message: 'Cannot fetch workout sessions'
      };
    }

    let query = supabase.from('workout_sessions').select('*');

    if (routineId) {
      query = query.eq('workout_routine_id', routineId);
    }

    const { data, error } = await query;

    return { 
      success: !error, 
      data: data as WorkoutSession[] || [], 
      error,
      message: error ? 'Failed to fetch workout sessions' : 'Workout sessions fetched successfully'
    };
  },

  async getSessionDetails(sessionId: string): Promise<ApiResponse<WorkoutSession>> {
    if (!isSupabaseConfigured || !supabase) {
      return { 
        success: false, 
        data: null, 
        error: new Error('Supabase not configured'),
        message: 'Cannot fetch session details'
      };
    }

    const { data, error } = await supabase
      .from('workout_sessions')
      .select('*, workout_exercise_logs(*)')
      .eq('id', sessionId)
      .single();

    return { 
      success: !error, 
      data: data as WorkoutSession || null, 
      error,
      message: error ? 'Failed to fetch session details' : 'Session details fetched successfully'
    };
  }
};

// Export as default for backward compatibility
export default workoutService;