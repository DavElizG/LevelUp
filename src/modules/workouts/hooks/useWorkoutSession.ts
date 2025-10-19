import { useState, useEffect, useCallback } from 'react';
import { WorkoutSessionService, type ActiveWorkoutSession } from '../services';
import type { Exercise } from '../../../shared/types/workout.types';

export interface UseWorkoutSessionProps {
  routineId: string;
  routineName: string;
  exercises: Exercise[];
}

export interface WorkoutSessionState {
  session: ActiveWorkoutSession | null;
  isLoading: boolean;
  error: string | null;
  currentExercise: Exercise | null;
  progress: {
    exerciseIndex: number;
    setNumber: number;
    totalExercises: number;
    completedExercises: number;
  };
  isResting: boolean;
  restTimeRemaining: number;
}

export function useWorkoutSession({ routineId, routineName, exercises }: UseWorkoutSessionProps) {
  const [state, setState] = useState<WorkoutSessionState>({
    session: null,
    isLoading: true,
    error: null,
    currentExercise: null,
    progress: {
      exerciseIndex: 0,
      setNumber: 1,
      totalExercises: exercises.length,
      completedExercises: 0
    },
    isResting: false,
    restTimeRemaining: 0
  });

  // Inicializar o reanudar sesión
  const initializeSession = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      console.log('Inicializando sesión para rutina:', routineId);

      // Verificar si existe sesión activa
      let session = await WorkoutSessionService.getActiveSession(routineId);
      
      console.log('Sesión existente encontrada:', !!session);

      // Si no existe, crear nueva sesión
      if (!session && exercises.length > 0) {
        console.log('Creando nueva sesión...');
        session = await WorkoutSessionService.createOrResumeSession(
          routineId,
          routineName,
          exercises[0]
        );
        console.log('Nueva sesión creada:', session?.id);
      }

      if (session) {
        const currentExercise = session.current_exercise_data.exercise || exercises[session.current_exercise_index] || null;
        
        setState(prev => ({
          ...prev,
          session,
          currentExercise,
          progress: {
            exerciseIndex: session.current_exercise_index,
            setNumber: session.current_set,
            totalExercises: exercises.length,
            completedExercises: session.completed_exercises.length
          },
          isResting: session.is_resting,
          restTimeRemaining: session.rest_timer_seconds,
          isLoading: false
        }));
      } else {
        setState(prev => ({ ...prev, isLoading: false, error: 'No se pudo inicializar la sesión' }));
      }
    } catch (error) {
      console.error('Error inicializando sesión:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      }));
    }
  }, [routineId, routineName, exercises]);

  // Completar serie
  const completeSet = useCallback(async (reps: number, weight?: number, notes?: string) => {
    if (!state.session) return false;

    try {
      const updatedSession = await WorkoutSessionService.completeSet(
        state.session.id,
        state.progress.setNumber,
        reps,
        weight,
        notes
      );

      setState(prev => ({
        ...prev,
        session: updatedSession,
        progress: {
          ...prev.progress,
          setNumber: updatedSession.current_set
        }
      }));

      return true;
    } catch (error) {
      console.error('Error completando serie:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Error completando serie' 
      }));
      return false;
    }
  }, [state.session, state.progress.setNumber]);

  // Avanzar al siguiente ejercicio
  const nextExercise = useCallback(async (saveCurrentAsCompleted: boolean = true) => {
    if (!state.session) return false;

    const nextExerciseIndex = state.progress.exerciseIndex + 1;
    if (nextExerciseIndex >= exercises.length) return false;

    const nextEx = exercises[nextExerciseIndex];
    if (!nextEx) return false;

    try {
      const updatedSession = await WorkoutSessionService.nextExercise(
        state.session.id,
        nextEx,
        saveCurrentAsCompleted
      );

      setState(prev => ({
        ...prev,
        session: updatedSession,
        currentExercise: nextEx,
        progress: {
          ...prev.progress,
          exerciseIndex: nextExerciseIndex,
          setNumber: 1,
          completedExercises: updatedSession.completed_exercises.length
        }
      }));

      return true;
    } catch (error) {
      console.error('Error avanzando ejercicio:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Error avanzando ejercicio' 
      }));
      return false;
    }
  }, [state.session, state.progress.exerciseIndex, exercises]);

  // Iniciar período de descanso
  const startRest = useCallback(async (restSeconds: number) => {
    if (!state.session) return false;

    try {
      const updatedSession = await WorkoutSessionService.startRestTimer(
        state.session.id,
        restSeconds
      );

      setState(prev => ({
        ...prev,
        session: updatedSession,
        isResting: true,
        restTimeRemaining: restSeconds
      }));

      return true;
    } catch (error) {
      console.error('Error iniciando descanso:', error);
      return false;
    }
  }, [state.session]);

  // Terminar período de descanso
  const endRest = useCallback(async () => {
    if (!state.session) return false;

    try {
      const updatedSession = await WorkoutSessionService.endRestTimer(state.session.id);

      setState(prev => ({
        ...prev,
        session: updatedSession,
        isResting: false,
        restTimeRemaining: 0
      }));

      return true;
    } catch (error) {
      console.error('Error terminando descanso:', error);
      return false;
    }
  }, [state.session]);

  // Pausar sesión
  const pauseSession = useCallback(async () => {
    if (!state.session) return false;

    try {
      await WorkoutSessionService.pauseSession(state.session.id);
      setState(prev => ({
        ...prev,
        session: prev.session ? { ...prev.session, is_paused: true } : null
      }));
      return true;
    } catch (error) {
      console.error('Error pausando sesión:', error);
      return false;
    }
  }, [state.session]);

  // Finalizar sesión
  const completeSession = useCallback(async () => {
    if (!state.session) return false;

    try {
      await WorkoutSessionService.completeSession(state.session.id);
      setState(prev => ({
        ...prev,
        session: null,
        currentExercise: null,
        isResting: false,
        restTimeRemaining: 0
      }));
      return true;
    } catch (error) {
      console.error('Error finalizando sesión:', error);
      return false;
    }
  }, [state.session]);

  // Obtener URL de progreso para compartir/guardar
  const getProgressUrl = useCallback(() => {
    if (!state.session) return null;
    return `/workouts/${routineId}/${state.progress.exerciseIndex}/${state.progress.setNumber}`;
  }, [routineId, state.session, state.progress.exerciseIndex, state.progress.setNumber]);

  // Verificar si se puede avanzar al siguiente ejercicio
  const canAdvanceToNext = useCallback(() => {
    return state.progress.exerciseIndex < exercises.length - 1;
  }, [state.progress.exerciseIndex, exercises.length]);

  // Verificar si el entrenamiento está completado
  const isWorkoutComplete = useCallback(() => {
    return state.progress.exerciseIndex >= exercises.length - 1;
  }, [state.progress.exerciseIndex, exercises.length]);

  // Inicializar sesión al montar
  useEffect(() => {
    if (routineId && exercises.length > 0) {
      initializeSession();
    }
  }, [initializeSession, routineId, exercises.length]);

  return {
    // Estado
    ...state,
    
    // Acciones
    completeSet,
    nextExercise,
    startRest,
    endRest,
    pauseSession,
    completeSession,
    initializeSession,
    
    // Utilidades
    getProgressUrl,
    canAdvanceToNext,
    isWorkoutComplete
  };
}