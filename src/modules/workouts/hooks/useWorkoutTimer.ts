import { useState, useEffect, useCallback, useRef } from 'react';
import type { WorkoutTimerState } from '../../../shared/types/workout.types';

interface UseWorkoutTimerProps {
  totalExercises: number;
  onTick?: (state: WorkoutTimerState) => void;
  onComplete?: () => void;
  onExerciseComplete?: (exerciseIndex: number) => void;
}

export function useWorkoutTimer({
  totalExercises,
  onTick,
  onComplete,
  onExerciseComplete,
}: UseWorkoutTimerProps) {
  const [timerState, setTimerState] = useState<WorkoutTimerState>({
    status: 'idle',
    currentExerciseIndex: 0,
    currentSet: 1,
    elapsedSeconds: 0,
    restTimeRemaining: 0,
    isResting: false,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTickRef = useRef<number>(Date.now());

  const tick = useCallback(() => {
    const now = Date.now();
    const delta = Math.floor((now - lastTickRef.current) / 1000);
    
    if (delta < 1) return;
    
    lastTickRef.current = now;

    setTimerState(prev => {
      const newState = { ...prev };

      if (prev.isResting && prev.restTimeRemaining > 0) {
        newState.restTimeRemaining = Math.max(0, prev.restTimeRemaining - delta);
        
        if (newState.restTimeRemaining === 0) {
          newState.isResting = false;
        }
      } else if (prev.status === 'running') {
        newState.elapsedSeconds = prev.elapsedSeconds + delta;
      }

      if (onTick) {
        onTick(newState);
      }

      return newState;
    });
  }, [onTick]);

  useEffect(() => {
    if (timerState.status === 'running') {
      intervalRef.current = setInterval(tick, 100);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState.status, tick]);

  const start = useCallback(() => {
    lastTickRef.current = Date.now();
    setTimerState(prev => ({ ...prev, status: 'running' }));
  }, []);

  const pause = useCallback(() => {
    setTimerState(prev => ({ ...prev, status: 'paused' }));
  }, []);

  const resume = useCallback(() => {
    lastTickRef.current = Date.now();
    setTimerState(prev => ({ ...prev, status: 'running' }));
  }, []);

  const reset = useCallback(() => {
    setTimerState({
      status: 'idle',
      currentExerciseIndex: 0,
      currentSet: 1,
      elapsedSeconds: 0,
      restTimeRemaining: 0,
      isResting: false,
    });
  }, []);

  const startRest = useCallback((restSeconds: number) => {
    setTimerState(prev => ({
      ...prev,
      isResting: true,
      restTimeRemaining: restSeconds,
    }));
  }, []);

  const skipRest = useCallback(() => {
    setTimerState(prev => ({
      ...prev,
      isResting: false,
      restTimeRemaining: 0,
    }));
  }, []);

  const nextSet = useCallback(() => {
    setTimerState(prev => ({
      ...prev,
      currentSet: prev.currentSet + 1,
      isResting: false,
      restTimeRemaining: 0,
    }));
  }, []);

  const nextExercise = useCallback(() => {
    setTimerState(prev => {
      const newIndex = prev.currentExerciseIndex + 1;
      
      if (onExerciseComplete) {
        onExerciseComplete(prev.currentExerciseIndex);
      }

      if (newIndex >= totalExercises) {
        if (onComplete) {
          onComplete();
        }
        return {
          ...prev,
          status: 'finished',
          currentExerciseIndex: newIndex,
        };
      }

      return {
        ...prev,
        currentExerciseIndex: newIndex,
        currentSet: 1,
        isResting: false,
        restTimeRemaining: 0,
      };
    });
  }, [totalExercises, onComplete, onExerciseComplete]);

  const skipExercise = useCallback(() => {
    nextExercise();
  }, [nextExercise]);

  const finish = useCallback(() => {
    setTimerState(prev => ({ ...prev, status: 'finished' }));
    if (onComplete) {
      onComplete();
    }
  }, [onComplete]);

  return {
    timerState,
    start,
    pause,
    resume,
    reset,
    startRest,
    skipRest,
    nextSet,
    nextExercise,
    skipExercise,
    finish,
  };
}
