import { supabase } from '../../../lib/supabase';
import type { Exercise } from '../../../shared/types/workout.types';

export interface CompletedExerciseData {
  exercise: Exercise;
  sets_completed: boolean[];
  reps_performed: number[];
  weights_used: number[];
  notes: string;
  completed_at: string;
}

export interface CurrentExerciseData {
  exercise?: Exercise;
  sets_completed?: boolean[];
  reps_performed?: number[];
  weights_used?: number[];
  notes?: string;
}

export interface ActiveWorkoutSession {
  id: string;
  user_id: string;
  routine_id: string;
  routine_name: string;
  current_exercise_index: number;
  current_set: number;
  current_day: number;
  completed_exercises: CompletedExerciseData[];
  current_exercise_data: CurrentExerciseData;
  started_at: string;
  last_activity_at: string;
  is_paused: boolean;
  rest_timer_seconds: number;
  is_resting: boolean;
  created_at: string;
  updated_at: string;
}

export class WorkoutSessionService {
  /**
   * Crear o reanudar una sesión de entrenamiento
   */
  static async createOrResumeSession(
    routineId: string, 
    routineName: string,
    initialExercise?: Exercise
  ): Promise<ActiveWorkoutSession> {
    if (!supabase) throw new Error('Cliente Supabase no disponible');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    // Verificar si ya existe una sesión activa para esta rutina
    const { data: existingSession, error: fetchError } = await supabase
      .from('active_workout_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('routine_id', routineId)
      .single();

    // Si hay error pero no es "not found", lanzar el error
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error buscando sesión existente:', fetchError);
      throw new Error(`Error al buscar sesión: ${fetchError.message}`);
    }

    if (existingSession) {
      // Reanudar sesión existente - actualizar timestamp
      const { data: updatedSession, error } = await supabase
        .from('active_workout_sessions')
        .update({ 
          last_activity_at: new Date().toISOString(),
          is_paused: false
        })
        .eq('id', existingSession.id)
        .select()
        .single();

      if (error) throw error;
      return updatedSession;
    }

    // Crear nueva sesión
    const { data: newSession, error } = await supabase
      .from('active_workout_sessions')
      .insert({
        user_id: user.id,
        routine_id: routineId,
        routine_name: routineName,
        current_exercise_index: 0,
        current_set: 1,
        current_day: 1,
        completed_exercises: [],
        current_exercise_data: initialExercise ? {
          exercise: initialExercise,
          sets_completed: [],
          reps_performed: [],
          weights_used: [],
          notes: ''
        } : {}
      })
      .select()
      .single();

    if (error) throw error;
    return newSession;
  }

  /**
   * Actualizar progreso de la sesión actual
   */
  static async updateSessionProgress(
    sessionId: string,
    updates: Partial<{
      current_exercise_index: number;
      current_set: number;
      current_day: number;
      completed_exercises: CompletedExerciseData[];
      current_exercise_data: CurrentExerciseData;
      rest_timer_seconds: number;
      is_resting: boolean;
    }>
  ): Promise<ActiveWorkoutSession> {
    if (!supabase) throw new Error('Cliente Supabase no disponible');
    const { data, error } = await supabase
      .from('active_workout_sessions')
      .update({
        ...updates,
        last_activity_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Marcar serie como completada
   */
  static async completeSet(
    sessionId: string,
    setNumber: number,
    reps: number,
    weight?: number,
    notes?: string
  ): Promise<ActiveWorkoutSession> {
    if (!supabase) throw new Error('Cliente Supabase no disponible');
    const { data: session } = await supabase
      .from('active_workout_sessions')
      .select('current_exercise_data, current_set')
      .eq('id', sessionId)
      .single();

    if (!session) throw new Error('Sesión no encontrada');

    const currentData = session.current_exercise_data || {};
    const setsCompleted = currentData.sets_completed || [];
    const repsPerformed = currentData.reps_performed || [];
    const weightsUsed = currentData.weights_used || [];

    // Actualizar arrays de progreso
    setsCompleted[setNumber - 1] = true;
    repsPerformed[setNumber - 1] = reps;
    if (weight !== undefined) {
      weightsUsed[setNumber - 1] = weight;
    }

    const updatedData = {
      ...currentData,
      sets_completed: setsCompleted,
      reps_performed: repsPerformed,
      weights_used: weightsUsed,
      notes: notes || currentData.notes || ''
    };

    return this.updateSessionProgress(sessionId, {
      current_exercise_data: updatedData,
      current_set: session.current_set + 1
    });
  }

  /**
   * Avanzar al siguiente ejercicio
   */
  static async nextExercise(
    sessionId: string, 
    nextExercise: Exercise,
    saveCurrentAsCompleted: boolean = true
  ): Promise<ActiveWorkoutSession> {
    if (!supabase) throw new Error('Cliente Supabase no disponible');
    const { data: session } = await supabase
      .from('active_workout_sessions')
      .select('current_exercise_index, completed_exercises, current_exercise_data')
      .eq('id', sessionId)
      .single();

    if (!session) throw new Error('Sesión no encontrada');

    let completedExercises = session.completed_exercises || [];
    
    // Si se guarda como completado, añadir a la lista
    if (saveCurrentAsCompleted && session.current_exercise_data) {
      completedExercises = [...completedExercises, {
        ...session.current_exercise_data,
        completed_at: new Date().toISOString()
      } as CompletedExerciseData];
    }

    return this.updateSessionProgress(sessionId, {
      current_exercise_index: session.current_exercise_index + 1,
      current_set: 1,
      completed_exercises: completedExercises,
      current_exercise_data: {
        exercise: nextExercise,
        sets_completed: [],
        reps_performed: [],
        weights_used: [],
        notes: ''
      }
    });
  }

  /**
   * Pausar sesión actual
   */
  static async pauseSession(sessionId: string): Promise<void> {
    if (!supabase) throw new Error('Cliente Supabase no disponible');
    const { error } = await supabase
      .from('active_workout_sessions')
      .update({ 
        is_paused: true,
        last_activity_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    if (error) throw error;
  }

  /**
   * Finalizar sesión y guardar en historial
   */
  static async completeSession(sessionId: string): Promise<void> {
    if (!supabase) throw new Error('Cliente Supabase no disponible');
    const { data: session } = await supabase
      .from('active_workout_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (!session) throw new Error('Sesión no encontrada');

    // Guardar estadísticas básicas del entrenamiento completado
    console.log(`Entrenamiento completado: ${session.routine_name}`);
    console.log(`Ejercicios completados: ${session.completed_exercises.length}`);
    console.log(`Duración: ${Date.now() - new Date(session.started_at).getTime()}ms`);

    // Eliminar sesión activa
    const { error } = await supabase
      .from('active_workout_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) throw error;
  }

  /**
   * Obtener sesión activa del usuario para una rutina
   */
  static async getActiveSession(routineId: string): Promise<ActiveWorkoutSession | null> {
    if (!supabase) {
      console.warn('Cliente Supabase no disponible');
      return null;
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn('Usuario no autenticado');
      return null;
    }

    console.log('Buscando sesión activa:', { userId: user.id, routineId });

    const { data, error } = await supabase
      .from('active_workout_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('routine_id', routineId)
      .single();

    if (error) {
      console.log('Error o sesión no encontrada:', error.message);
      return null;
    }
    
    console.log('Sesión activa encontrada:', data.id);
    return data;
  }

  /**
   * Listar todas las sesiones activas del usuario
   */
  static async getUserActiveSessions(): Promise<ActiveWorkoutSession[]> {
    if (!supabase) return [];
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('active_workout_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('last_activity_at', { ascending: false });

    if (error) return [];
    return data || [];
  }

  /**
   * Manejar descanso entre series
   */
  static async startRestTimer(
    sessionId: string, 
    restSeconds: number
  ): Promise<ActiveWorkoutSession> {
    return this.updateSessionProgress(sessionId, {
      rest_timer_seconds: restSeconds,
      is_resting: true
    });
  }

  /**
   * Terminar período de descanso
   */
  static async endRestTimer(sessionId: string): Promise<ActiveWorkoutSession> {
    return this.updateSessionProgress(sessionId, {
      rest_timer_seconds: 0,
      is_resting: false
    });
  }
}