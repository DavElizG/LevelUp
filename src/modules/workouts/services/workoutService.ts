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

    // Usar función almacenada para obtener rutina con ejercicios
    const { data, error } = await supabase.rpc('get_workout_with_exercises', {
      p_routine_id: id
    });

    console.log('🔍 [getWorkout] RPC raw response:', JSON.stringify(data, null, 2));
    console.log('🔍 [getWorkout] Data type:', typeof data);
    console.log('🔍 [getWorkout] Is array?', Array.isArray(data));

    if (error) {
      console.error('❌ Error fetching workout:', error);
      return {
        success: false,
        data: null,
        error,
        message: 'Failed to fetch workout'
      };
    }

    // Supabase returns JSONB stored procedures as direct objects, not arrays
    let routine = null;
    if (data && typeof data === 'object') {
      // Handle array response (some Supabase versions wrap in array)
      if (Array.isArray(data) && data.length > 0) {
        const firstItem = data[0];
        if (firstItem && typeof firstItem === 'object' && 'get_workout_with_exercises' in firstItem) {
          routine = firstItem.get_workout_with_exercises;
        } else {
          routine = firstItem;
        }
      } 
      // Handle direct object response (current case - Supabase returns JSONB as object)
      else if (!Array.isArray(data)) {
        routine = data;
        console.log('✅ [getWorkout] Using direct object response, routine:', data.name);
      }
    }

    if (!routine) {
      console.error('❌ [getWorkout] Failed to extract routine from response');
    }

    console.log('📦 [getWorkout] Final routine:', routine?.name || 'null');

    return { 
      success: true, 
      data: routine as WorkoutRoutine, 
      error: null,
      message: 'Workout fetched successfully'
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  },

  async getPublicWorkouts(): Promise<ApiResponse<WorkoutRoutine[]>> {
    if (!isSupabaseConfigured || !supabase) {
      return { 
        success: true, 
        data: [], 
        error: null,
        message: 'No public workouts available'
      };
    }

    // Usar función almacenada para obtener rutinas con ejercicios correctamente
    const { data, error } = await supabase.rpc('get_public_workouts_with_exercises');

    if (error) {
      console.error('❌ Error fetching public workouts:', error);
      return {
        success: false,
        data: [],
        error,
        message: 'Failed to fetch public workouts'
      };
    }

    // La función ya devuelve el array directamente
    return { 
      success: true, 
      data: (data || []) as WorkoutRoutine[], 
      error: null,
      message: 'Public workouts fetched successfully'
    };
  },

  async getUserWorkouts(): Promise<ApiResponse<WorkoutRoutine[]>> {
    if (!isSupabaseConfigured || !supabase) {
      return { 
        success: true, 
        data: mockRoutines, 
        error: null,
        message: 'Mock data loaded successfully'
      };
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { 
        success: false,
        data: [], 
        error: new Error('Usuario no autenticado'),
        message: 'Authentication required'
      };
    }

    // Usar función almacenada para obtener rutinas del usuario con ejercicios
    const { data, error } = await supabase.rpc('get_user_workouts_with_exercises', {
      p_user_id: user.id
    });

    if (error) {
      console.error('❌ Error fetching user workouts:', error);
      return {
        success: false,
        data: [],
        error,
        message: 'Failed to fetch user workouts'
      };
    }

    // La función ya devuelve el array directamente
    return { 
      success: true, 
      data: (data || []) as WorkoutRoutine[], 
      error: null,
      message: 'User workouts fetched successfully'
    };
  },

  async clonePublicWorkout(routineId: string): Promise<ApiResponse<WorkoutRoutine>> {
    if (!isSupabaseConfigured || !supabase) {
      return { 
        success: false, 
        data: null, 
        error: new Error('Supabase not configured'),
        message: 'Cannot clone workout'
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

    // Get the public routine with all exercises
    const { data: originalRoutine, error: fetchError } = await supabase
      .from('workout_routines')
      .select(`
        *,
        exercises:routine_exercises(
          *,
          exercise:exercises(*)
        )
      `)
      .eq('id', routineId)
      .eq('is_public', true)
      .single();

    if (fetchError || !originalRoutine) {
      return { 
        success: false,
        data: null, 
        error: fetchError || new Error('Rutina no encontrada'),
        message: 'Failed to fetch routine to clone'
      };
    }

    // Create new routine for the user
    const { data: newRoutine, error: createError } = await supabase
      .from('workout_routines')
      .insert({
        user_id: user.id,
        name: `${originalRoutine.name} (Copia)`,
        description: originalRoutine.description,
        difficulty_level: originalRoutine.difficulty_level,
        days_per_week: originalRoutine.days_per_week,
        goal: originalRoutine.goal,
        is_public: false,
        generated_by_ai: false
      })
      .select()
      .single();

    if (createError || !newRoutine) {
      return { 
        success: false,
        data: null, 
        error: createError || new Error('Error creando rutina'),
        message: 'Failed to create cloned routine'
      };
    }

    // Clone all exercises
    interface RoutineExerciseData {
      exercise_id: string;
      day_of_week: number;
      order_in_day: number;
      sets: number;
      reps_min: number;
      reps_max: number;
      rest_seconds: number;
      notes?: string;
    }
    
    const routineWithExercises = originalRoutine as unknown as {
      exercises: RoutineExerciseData[];
    };
    
    const exercisesToClone = routineWithExercises.exercises.map((ex) => ({
      routine_id: newRoutine.id,
      exercise_id: ex.exercise_id,
      day_of_week: ex.day_of_week,
      order_in_day: ex.order_in_day,
      sets: ex.sets,
      reps_min: ex.reps_min,
      reps_max: ex.reps_max,
      rest_seconds: ex.rest_seconds,
      notes: ex.notes
    }));

    const { error: exercisesError } = await supabase
      .from('routine_exercises')
      .insert(exercisesToClone);

    if (exercisesError) {
      // Rollback: delete the created routine
      await supabase.from('workout_routines').delete().eq('id', newRoutine.id);
      
      return { 
        success: false,
        data: null, 
        error: exercisesError,
        message: 'Failed to clone exercises'
      };
    }

    // Fetch the complete cloned routine
    const { data: completeRoutine, error: finalError } = await supabase
      .from('workout_routines')
      .select(`
        *,
        exercises:routine_exercises(
          *,
          exercise:exercises(*)
        )
      `)
      .eq('id', newRoutine.id)
      .single();

    return { 
      success: !finalError, 
      data: completeRoutine as WorkoutRoutine || null, 
      error: finalError,
      message: finalError ? 'Failed to fetch cloned routine' : 'Rutina clonada exitosamente'
    };
  },

  // ============== NUEVOS MÉTODOS PARA EDICIÓN GRANULAR ==============

  async updateWorkoutBasicInfo(
    routineId: string,
    updates: {
      name?: string;
      description?: string;
      goal?: string;
      difficultyLevel?: string;
      daysPerWeek?: number;
    }
  ): Promise<ApiResponse<WorkoutRoutine>> {
    if (!isSupabaseConfigured || !supabase) {
      return { 
        success: false, 
        data: null, 
        error: new Error('Supabase not configured'),
        message: 'Cannot update workout'
      };
    }

    const { data, error } = await supabase.rpc('update_workout_basic_info', {
      p_routine_id: routineId,
      p_name: updates.name || null,
      p_description: updates.description || null,
      p_goal: updates.goal || null,
      p_difficulty_level: updates.difficultyLevel || null,
      p_days_per_week: updates.daysPerWeek || null
    });

    if (error) {
      return { 
        success: false, 
        data: null, 
        error,
        message: 'Failed to update workout info'
      };
    }

    return { 
      success: true, 
      data: data as WorkoutRoutine, 
      error: null,
      message: 'Workout updated successfully'
    };
  },

  async moveExerciseToDay(
    routineExerciseId: string,
    newDayOfWeek: number,
    newOrderInDay?: number
  ): Promise<ApiResponse<WorkoutRoutine>> {
    if (!isSupabaseConfigured || !supabase) {
      return { 
        success: false, 
        data: null, 
        error: new Error('Supabase not configured'),
        message: 'Cannot move exercise'
      };
    }

    const { data, error } = await supabase.rpc('move_exercise_to_day', {
      p_routine_exercise_id: routineExerciseId,
      p_new_day_of_week: newDayOfWeek,
      p_new_order_in_day: newOrderInDay || null
    });

    if (error) {
      return { 
        success: false, 
        data: null, 
        error,
        message: 'Failed to move exercise'
      };
    }

    return { 
      success: true, 
      data: data as WorkoutRoutine, 
      error: null,
      message: 'Exercise moved successfully'
    };
  },

  async updateRoutineExercise(
    routineExerciseId: string,
    updates: {
      sets?: number;
      repsMin?: number;
      repsMax?: number;
      restSeconds?: number;
      weightKg?: number;
      notes?: string;
    }
  ): Promise<ApiResponse<WorkoutRoutine>> {
    if (!isSupabaseConfigured || !supabase) {
      return { 
        success: false, 
        data: null, 
        error: new Error('Supabase not configured'),
        message: 'Cannot update exercise'
      };
    }

    const { data, error } = await supabase.rpc('update_routine_exercise', {
      p_routine_exercise_id: routineExerciseId,
      p_sets: updates.sets || null,
      p_reps_min: updates.repsMin || null,
      p_reps_max: updates.repsMax || null,
      p_rest_seconds: updates.restSeconds || null,
      p_weight_kg: updates.weightKg || null,
      p_notes: updates.notes || null
    });

    if (error) {
      return { 
        success: false, 
        data: null, 
        error,
        message: 'Failed to update exercise'
      };
    }

    return { 
      success: true, 
      data: data as WorkoutRoutine, 
      error: null,
      message: 'Exercise updated successfully'
    };
  },

  async removeExerciseFromRoutine(routineExerciseId: string): Promise<ApiResponse<WorkoutRoutine>> {
    if (!isSupabaseConfigured || !supabase) {
      return { 
        success: false, 
        data: null, 
        error: new Error('Supabase not configured'),
        message: 'Cannot remove exercise'
      };
    }

    const { data, error } = await supabase.rpc('remove_exercise_from_routine', {
      p_routine_exercise_id: routineExerciseId
    });

    if (error) {
      return { 
        success: false, 
        data: null, 
        error,
        message: 'Failed to remove exercise'
      };
    }

    return { 
      success: true, 
      data: data as WorkoutRoutine, 
      error: null,
      message: 'Exercise removed successfully'
    };
  },

  async addExerciseToRoutine(
    routineId: string,
    exerciseId: string,
    dayOfWeek: number,
    options?: {
      orderInDay?: number;
      sets?: number;
      repsMin?: number;
      repsMax?: number;
      restSeconds?: number;
      weightKg?: number;
      notes?: string;
    }
  ): Promise<ApiResponse<WorkoutRoutine>> {
    if (!isSupabaseConfigured || !supabase) {
      return { 
        success: false, 
        data: null, 
        error: new Error('Supabase not configured'),
        message: 'Cannot add exercise'
      };
    }

    const { data, error } = await supabase.rpc('add_exercise_to_routine', {
      p_routine_id: routineId,
      p_exercise_id: exerciseId,
      p_day_of_week: dayOfWeek,
      p_order_in_day: options?.orderInDay || null,
      p_sets: options?.sets || 3,
      p_reps_min: options?.repsMin || 8,
      p_reps_max: options?.repsMax || 12,
      p_rest_seconds: options?.restSeconds || 90,
      p_weight_kg: options?.weightKg || null,
      p_notes: options?.notes || null
    });

    if (error) {
      return { 
        success: false, 
        data: null, 
        error,
        message: 'Failed to add exercise'
      };
    }

    return { 
      success: true, 
      data: data as WorkoutRoutine, 
      error: null,
      message: 'Exercise added successfully'
    };
  },

  async reorderExercisesInDay(
    routineId: string,
    dayOfWeek: number,
    exerciseOrders: Array<{ id: string; order: number }>
  ): Promise<ApiResponse<WorkoutRoutine>> {
    if (!isSupabaseConfigured || !supabase) {
      return { 
        success: false, 
        data: null, 
        error: new Error('Supabase not configured'),
        message: 'Cannot reorder exercises'
      };
    }

    const { data, error } = await supabase.rpc('reorder_exercises_in_day', {
      p_routine_id: routineId,
      p_day_of_week: dayOfWeek,
      p_exercise_orders: JSON.stringify(exerciseOrders)
    });

    if (error) {
      return { 
        success: false, 
        data: null, 
        error,
        message: 'Failed to reorder exercises'
      };
    }

    return { 
      success: true, 
      data: data as WorkoutRoutine, 
      error: null,
      message: 'Exercises reordered successfully'
    };
  }
};

// Export as default for backward compatibility
export default workoutService;