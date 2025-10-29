import React from 'react';
import type { RoutineExercise } from '../../../../shared/types/workout.types';
import { calculateAutoRestTime, formatRestTime } from '../../utils/restCalculator';

interface WorkoutExerciseCardProps {
  exercise: RoutineExercise;
  orderInDay: number;
  onRemove?: () => void;
  onUpdate?: (updates: Partial<RoutineExercise>) => void;
  editMode?: boolean;
}

export const WorkoutExerciseCard: React.FC<WorkoutExerciseCardProps> = ({
  exercise,
  orderInDay,
  onRemove,
  onUpdate,
  editMode = false,
}) => {
  const exerciseData = exercise.exercise;
  const muscleGroups = exerciseData?.muscleGroups?.join(', ') || 'N/A';
  const thumbnailUrl = exerciseData?.thumbnailUrl || exerciseData?.videoUrl;
  
  // Calcular descanso automático si no está especificado
  const effectiveRestTime = exercise.restSeconds || 
    (exerciseData ? calculateAutoRestTime(exerciseData, exercise.sets, exercise.repsMin || 10) : 60);

  return (
    <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-4 hover:border-orange-300 transition-all">
      <div className="flex gap-4">
        {/* Miniatura del ejercicio */}
        <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
          {thumbnailUrl ? (
            <img 
              src={thumbnailUrl} 
              alt={exerciseData?.name || 'Ejercicio'} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Información del ejercicio */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-orange-500 text-white text-xs font-bold rounded-full">
                  {orderInDay}
                </span>
                <h4 className="font-semibold text-gray-900 text-base truncate">
                  {exerciseData?.name || 'Ejercicio sin nombre'}
                </h4>
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                <span className="bg-gray-100 px-2 py-0.5 rounded-md">
                  {muscleGroups}
                </span>
                {exerciseData?.category && (
                  <span className="text-gray-500">• {exerciseData.category}</span>
                )}
              </div>
            </div>

            {editMode && onRemove && (
              <button
                onClick={onRemove}
                type="button"
                className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                aria-label="Eliminar ejercicio"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Detalles del ejercicio */}
          <div className="grid grid-cols-3 gap-3 mt-3">
            {editMode && onUpdate ? (
              <>
                <div>
                  <span className="block text-xs font-medium text-gray-600 mb-1">Series</span>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={exercise.sets}
                    onChange={(e) => onUpdate({ sets: Number(e.target.value) })}
                    className="w-full px-2 py-1 text-sm border-2 border-gray-300 rounded-md focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-600 mb-1">Reps</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={exercise.repsMin || 8}
                      onChange={(e) => onUpdate({ repsMin: Number(e.target.value) })}
                      className="w-full px-2 py-1 text-sm border-2 border-gray-300 rounded-md focus:border-orange-500 focus:outline-none"
                    />
                    <span className="text-xs text-gray-500">-</span>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={exercise.repsMax || 12}
                      onChange={(e) => onUpdate({ repsMax: Number(e.target.value) })}
                      className="w-full px-2 py-1 text-sm border-2 border-gray-300 rounded-md focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-600 mb-1">
                    Descanso <span className="text-gray-400">(opcional)</span>
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={300}
                    step={15}
                    placeholder="Auto"
                    value={exercise.restSeconds || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      onUpdate({ restSeconds: val === '' ? undefined : Number(val) });
                    }}
                    className="w-full px-2 py-1 text-sm border-2 border-gray-300 rounded-md focus:border-orange-500 focus:outline-none"
                  />
                  {!exercise.restSeconds && (
                    <span className="text-xs text-blue-600 mt-1 block">
                      Auto: {formatRestTime(effectiveRestTime)}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Series</p>
                  <p className="text-sm font-semibold text-gray-900">{exercise.sets}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Reps</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {exercise.repsMin || 8}-{exercise.repsMax || 12}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Descanso</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatRestTime(effectiveRestTime)}
                  </p>
                  {!exercise.restSeconds && (
                    <span className="text-xs text-blue-600">Auto</span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
