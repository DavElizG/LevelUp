import React from 'react';
import { useWorkoutTimer } from '../hooks/useWorkoutTimer';
import type { RoutineExercise } from '../../../shared/types/workout.types';
import { calculateAutoRestTime } from '../utils/restCalculator';

interface WorkoutTimerDisplayProps {
  exercises: RoutineExercise[];
  onComplete?: () => void;
  onExit?: () => void;
}

export const WorkoutTimerDisplay: React.FC<WorkoutTimerDisplayProps> = ({
  exercises,
  onComplete,
  onExit,
}) => {
  const {
    timerState,
    start,
    pause,
    resume,
    startRest,
    skipRest,
    nextSet,
    nextExercise,
    finish,
  } = useWorkoutTimer({
    totalExercises: exercises.length,
    onComplete,
  });

  const currentExercise = exercises[timerState.currentExerciseIndex];
  const exerciseData = currentExercise?.exercise;

  const handleCompleteSet = () => {
    const totalSets = currentExercise.sets;
    
    if (timerState.currentSet < totalSets) {
      // Iniciar descanso automático
      const restTime = currentExercise.restSeconds || 
        (exerciseData ? calculateAutoRestTime(exerciseData, currentExercise.sets, currentExercise.repsMin || 10) : 60);
      
      startRest(restTime);
      nextSet();
    } else {
      // Último set completado, siguiente ejercicio
      nextExercise();
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (timerState.status === 'finished') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">¡Entrenamiento Completado!</h2>
            <p className="text-gray-600">Tiempo total: {formatTime(timerState.elapsedSeconds)}</p>
          </div>
          <button
            onClick={onExit}
            className="w-full py-4 bg-orange-500 text-white rounded-xl font-semibold text-lg hover:bg-orange-600 transition-colors"
          >
            Finalizar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-orange-500 to-red-600 flex flex-col z-50">
      {/* Header */}
      <div className="bg-black bg-opacity-20 p-4 flex items-center justify-between">
        <div className="text-white">
          <p className="text-sm opacity-90">Ejercicio {timerState.currentExerciseIndex + 1} de {exercises.length}</p>
          <p className="text-2xl font-bold">{formatTime(timerState.elapsedSeconds)}</p>
        </div>
        <button
          onClick={() => {
            if (globalThis.confirm('¿Terminar entrenamiento?')) {
              finish();
            }
          }}
          className="p-3 bg-white bg-opacity-20 rounded-lg text-white hover:bg-opacity-30 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {timerState.isResting ? (
          <div className="text-center">
            <p className="text-white text-2xl font-semibold mb-4">Descanso</p>
            <div className="text-white text-8xl font-bold mb-8">
              {timerState.restTimeRemaining}
            </div>
            <button
              onClick={skipRest}
              className="px-8 py-4 bg-white text-orange-600 rounded-2xl font-bold text-xl hover:bg-opacity-90 transition-all transform hover:scale-105"
            >
              Saltar Descanso
            </button>
          </div>
        ) : (
          <div className="w-full max-w-md">
            {/* Imagen del ejercicio */}
            {exerciseData?.thumbnailUrl && (
              <div className="mb-6 rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src={exerciseData.thumbnailUrl} 
                  alt={exerciseData.name}
                  className="w-full h-64 object-cover"
                />
              </div>
            )}

            {/* Info del ejercicio */}
            <div className="bg-white rounded-2xl p-6 shadow-2xl">
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {exerciseData?.name || 'Ejercicio'}
              </h3>
              <p className="text-gray-600 mb-6">
                {exerciseData?.muscleGroups?.join(', ')}
              </p>

              {/* Series y Reps */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Serie</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {timerState.currentSet}/{currentExercise.sets}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Repeticiones</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {currentExercise.repsMin}-{currentExercise.repsMax}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Descanso</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {currentExercise.restSeconds || 
                      (exerciseData ? calculateAutoRestTime(exerciseData, currentExercise.sets, currentExercise.repsMin || 10) : 60)}s
                  </p>
                </div>
              </div>

              {/* Botones de control */}
              <div className="space-y-3">
                {timerState.status === 'idle' && (
                  <button
                    onClick={start}
                    className="w-full py-5 bg-orange-500 text-white rounded-xl font-bold text-xl hover:bg-orange-600 transition-colors shadow-lg"
                  >
                    Iniciar Entrenamiento
                  </button>
                )}

                {timerState.status === 'running' && (
                  <>
                    <button
                      onClick={pause}
                      className="w-full py-5 bg-yellow-500 text-white rounded-xl font-bold text-xl hover:bg-yellow-600 transition-colors shadow-lg"
                    >
                      ⏸ Pausar
                    </button>
                    <button
                      onClick={handleCompleteSet}
                      className="w-full py-5 bg-green-500 text-white rounded-xl font-bold text-xl hover:bg-green-600 transition-colors shadow-lg"
                    >
                      ✓ Serie Completada
                    </button>
                  </>
                )}

                {timerState.status === 'paused' && (
                  <>
                    <button
                      onClick={resume}
                      className="w-full py-5 bg-orange-500 text-white rounded-xl font-bold text-xl hover:bg-orange-600 transition-colors shadow-lg"
                    >
                      ▶ Continuar
                    </button>
                    <button
                      onClick={nextExercise}
                      className="w-full py-4 bg-gray-600 text-white rounded-xl font-semibold text-lg hover:bg-gray-700 transition-colors"
                    >
                      Saltar Ejercicio
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Progreso */}
      <div className="bg-black bg-opacity-20 p-4">
        <div className="bg-white bg-opacity-30 rounded-full h-3 overflow-hidden">
          <div
            className="bg-white h-full transition-all duration-300"
            style={{
              width: `${((timerState.currentExerciseIndex + 1) / exercises.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
