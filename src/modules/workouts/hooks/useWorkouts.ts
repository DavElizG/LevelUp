import { useState, useEffect, useCallback } from 'react';
import workoutService from '../services/workoutService';
import type { 
  WorkoutRoutine, 
  Exercise, 
  CreateWorkoutData,
  ExerciseSearchFilters 
} from '../../../shared/types/workout.types';

export function useWorkouts() {
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoutines = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await workoutService.getWorkouts();
    if (res.error) {
      setError(typeof res.error === 'string' ? res.error : res.error.message);
    } else if (res.data) {
      setRoutines(res.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRoutines();
  }, [fetchRoutines]);

  const createRoutine = useCallback(async (data: CreateWorkoutData): Promise<WorkoutRoutine | null> => {
    setLoading(true);
    setError(null);
    const res = await workoutService.createWorkout(data);
    setLoading(false);
    
    if (res.error) {
      setError(typeof res.error === 'string' ? res.error : res.error.message);
      return null;
    }
    
    if (res.data) {
      await fetchRoutines();
      return res.data;
    }
    
    return null;
  }, [fetchRoutines]);

  const deleteRoutine = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    const res = await workoutService.deleteWorkout(id);
    setLoading(false);
    
    if (res.error) {
      setError(typeof res.error === 'string' ? res.error : res.error.message);
      return false;
    }
    
    await fetchRoutines();
    return true;
  }, [fetchRoutines]);

  return {
    routines,
    loading,
    error,
    fetchRoutines,
    createRoutine,
    deleteRoutine,
  };
}

export function useExerciseSearch(initialFilters?: ExerciseSearchFilters) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ExerciseSearchFilters>(initialFilters ?? {});

  // Debounce effect para búsqueda con delay de 300ms
  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);

      const res = await workoutService.searchExercises(filters);
      
      if (res.error) {
        setError(typeof res.error === 'string' ? res.error : res.error.message);
      } else if (res.data) {
        setExercises(res.data);
      }
      
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters]);

  const search = useCallback(async (newFilters?: ExerciseSearchFilters) => {
    const searchFilters = newFilters ?? filters;
    setLoading(true);
    setError(null);

    const res = await workoutService.searchExercises(searchFilters);
    
    if (res.error) {
      setError(typeof res.error === 'string' ? res.error : res.error.message);
    } else if (res.data) {
      setExercises(res.data);
    }
    
    setLoading(false);
  }, [filters]);

  const updateFilters = useCallback((newFilters: Partial<ExerciseSearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});
  }, []);

  return {
    exercises,
    loading,
    error,
    filters,
    search,
    updateFilters,
    resetFilters,
  };
}
