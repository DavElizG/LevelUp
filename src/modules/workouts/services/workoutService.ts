import supabase, { isSupabaseConfigured } from '../../../lib/supabase';
import type { 
  WorkoutService, 
  WorkoutRoutine, 
  Exercise, 
  CreateWorkoutData,
  WorkoutSession,
  CreateWorkoutSessionData,
  CreateExerciseLogData,
  WorkoutExerciseLog
} from '../../../shared/types/workout.types';

const mockRoutines: WorkoutRoutine[] = [
  {
    id: 'mock-1',
    userId: 'user-1',
    name: 'Rutina Full Body (mock)',
    description: 'Rutina generada - cuerpo completo',
    goal: 'general',
    difficultyLevel: 'intermediate',
    durationWeeks: 4,
    daysPerWeek: 3,
    generatedByAi: false,
    isActive: true,
    exercises: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const workoutService: WorkoutService = {
  async getWorkouts() {
    if (!isSupabaseConfigured || !supabase) return { data: mockRoutines, error: null };

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

    return { data: data as WorkoutRoutine[], error };
  },

  async getWorkout(id: string) {
    if (!isSupabaseConfigured || !supabase) return { data: mockRoutines[0], error: null };

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

    return { data: data as WorkoutRoutine, error };
  },

  async createWorkout(workout: CreateWorkoutData) {
    if (!isSupabaseConfigured || !supabase) return { data: mockRoutines[0], error: null };

    // Insert the routine first (omit nested exercises)
    const routinePayload = {
      user_id: workout.userId ?? null,
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
    };

    const { data: routineData, error: routineError } = await supabase.from('workout_routines').insert(routinePayload).select().single();
    if (routineError) return { data: null, error: routineError };

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

      const { error: exercisesError } = await supabase.from('routine_exercises').insert(exercisesToInsert);
      if (exercisesError) {
        // rollback
        await supabase.from('workout_routines').delete().eq('id', routineData.id);
        return { data: null, error: exercisesError };
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

    return { data: data as WorkoutRoutine, error };
  },

  async updateWorkout(id: string, workout) {
    if (!isSupabaseConfigured || !supabase) return { data: mockRoutines[0], error: null };

    const { data, error } = await supabase.from('workout_routines').update(workout).eq('id', id).select().single();
    return { data: data as WorkoutRoutine, error };
  },

  async deleteWorkout(id: string) {
    if (!isSupabaseConfigured || !supabase) return { data: null, error: null };

    const { error } = await supabase.from('workout_routines').delete().eq('id', id);
    return { data: null, error };
  },

  async generateAIWorkout(_preferences: Record<string, unknown>) {
    // Placeholder: future integration point for AI generation
    return { data: mockRoutines[0], error: null };
  },

  async getExercises() {
    if (!isSupabaseConfigured || !supabase) return { data: [] as Exercise[], error: null };

    const { data, error } = await supabase.from('exercises').select('*');
    return { data: data as Exercise[], error };
  },

  // Session management methods
  async startWorkoutSession(routineId: string) {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: new Error('Supabase no configurado') };
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: new Error('Usuario no autenticado') };
    }

    const sessionData: CreateWorkoutSessionData = {
      userId: user.id,
      routineId,
      sessionDate: new Date().toISOString().split('T')[0],
      startTime: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('workout_sessions')
      .insert({
        user_id: sessionData.userId,
        routine_id: sessionData.routineId,
        session_date: sessionData.sessionDate,
        start_time: sessionData.startTime,
      })
      .select()
      .single();

    return { data: data as WorkoutSession, error };
  },

  async endWorkoutSession(sessionId: string, rating?: number, notes?: string) {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: new Error('Supabase no configurado') };
    }

    const { data, error } = await supabase
      .from('workout_sessions')
      .update({
        end_time: new Date().toISOString(),
        rating: rating ?? null,
        notes: notes ?? null,
      })
      .eq('id', sessionId)
      .select()
      .single();

    return { data: data as WorkoutSession, error };
  },

  async logExercise(sessionId: string, exerciseLog: CreateExerciseLogData) {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: new Error('Supabase no configurado') };
    }

    const { data, error } = await supabase
      .from('workout_exercise_logs')
      .insert({
        session_id: sessionId,
        exercise_id: exerciseLog.exerciseId,
        order_performed: exerciseLog.orderPerformed,
        sets_completed: exerciseLog.setsCompleted,
        reps_performed: exerciseLog.repsPerformed,
        weight_used_kg: exerciseLog.weightUsedKg,
        rest_time_seconds: exerciseLog.restTimeSeconds ?? null,
        skipped: exerciseLog.skipped,
        notes: exerciseLog.notes ?? null,
      })
      .select()
      .single();

    return { data: data as WorkoutExerciseLog, error };
  },

  async getWorkoutSessions(routineId?: string) {
    if (!isSupabaseConfigured || !supabase) {
      return { data: [], error: null };
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: [], error: new Error('Usuario no autenticado') };
    }

    let query = supabase
      .from('workout_sessions')
      .select(`
        *,
        exerciseLogs:workout_exercise_logs(
          *,
          exercise:exercises(*)
        )
      `)
      .eq('user_id', user.id)
      .order('session_date', { ascending: false });

    if (routineId) {
      query = query.eq('routine_id', routineId);
    }

    const { data, error } = await query;
    return { data: data as WorkoutSession[], error };
  },

  async getSessionDetails(sessionId: string) {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: new Error('Supabase no configurado') };
    }

    const { data, error } = await supabase
      .from('workout_sessions')
      .select(`
        *,
        exerciseLogs:workout_exercise_logs(
          *,
          exercise:exercises(*)
        )
      `)
      .eq('id', sessionId)
      .single();

    return { data: data as WorkoutSession, error };
  }
};

export default workoutService;
