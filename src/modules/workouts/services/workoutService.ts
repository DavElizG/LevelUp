import supabase, { isSupabaseConfigured } from '../../../lib/supabase';
import type { WorkoutService, WorkoutRoutine, Exercise, CreateWorkoutData } from '../../../shared/types/workout.types';

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
    if (!isSupabaseConfigured || !supabase) return { data: mockRoutines, error: null } as any;

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

    return { data: data as WorkoutRoutine[], error } as any;
  },

  async getWorkout(id: string) {
    if (!isSupabaseConfigured || !supabase) return { data: mockRoutines[0], error: null } as any;

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

    return { data: data as WorkoutRoutine, error } as any;
  },

  async createWorkout(workout: CreateWorkoutData) {
    if (!isSupabaseConfigured || !supabase) return { data: mockRoutines[0], error: null } as any;

    // Insert the routine first (omit nested exercises)
    const routinePayload: any = {
      user_id: workout.userId ?? null,
      name: workout.name,
      description: workout.description ?? null,
      goal: workout.goal ?? null,
      difficulty_level: workout.difficultyLevel ?? null,
      duration_weeks: workout.durationWeeks ?? null,
      days_per_week: workout.daysPerWeek ?? null,
      generated_by_ai: workout.generatedByAi ?? false,
      ai_prompt: (workout as any).aiPrompt ?? null,
      ai_model: (workout as any).aiModel ?? null,
      is_active: (workout as any).isActive ?? true,
    };

    const { data: routineData, error: routineError } = await supabase.from('workout_routines').insert(routinePayload).select().single();
    if (routineError) return { data: null, error: routineError } as any;

    // Insert routine_exercises if any
    if ((workout as any).exercises && (workout as any).exercises.length > 0) {
      const exercisesToInsert = (workout as any).exercises.map((ex: any) => ({
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
        return { data: null, error: exercisesError } as any;
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

    return { data: data as WorkoutRoutine, error } as any;
  },

  async updateWorkout(id: string, workout) {
    if (!isSupabaseConfigured || !supabase) return { data: mockRoutines[0], error: null } as any;

    const { data, error } = await supabase.from('workout_routines').update(workout).eq('id', id).select().single();
    return { data: data as WorkoutRoutine, error } as any;
  },

  async deleteWorkout(id: string) {
    if (!isSupabaseConfigured || !supabase) return { data: null, error: null } as any;

    const { error } = await supabase.from('workout_routines').delete().eq('id', id);
    return { data: null, error } as any;
  },

  async generateAIWorkout(_preferences: Record<string, unknown>) {
    // Placeholder: future integration point for AI generation
    return { data: mockRoutines[0], error: null } as any;
  },

  async getExercises() {
    if (!isSupabaseConfigured || !supabase) return { data: [] as Exercise[], error: null } as any;

    const { data, error } = await supabase.from('exercises').select('*');
    return { data: data as Exercise[], error } as any;
  }
};

export default workoutService;
