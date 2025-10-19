import React from 'react';
import type { RoutineExercise } from '../../../shared/types/workout.types';
import { WorkoutExerciseCard } from './WorkoutExerciseCard';
//import { WorkoutExerciseCard } from './WorkoutExerciseCard';

interface WorkoutDaySectionProps {
  dayNumber: number;
  exercises: RoutineExercise[];
  onRemoveExercise?: (exerciseId: string) => void;
  onUpdateExercise?: (exerciseId: string, updates: Partial<RoutineExercise>) => void;
  editMode?: boolean;
}

export const WorkoutDaySection: React.FC<WorkoutDaySectionProps> = ({
  dayNumber,
  exercises,
  onRemoveExercise,
  onUpdateExercise,
  editMode = false,
}) => {
  const dayName = getDayName(dayNumber);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4 px-4">
        <h3 className="text-xl font-bold text-gray-900">
          {dayName}
        </h3>
        <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
          {exercises.length} {exercises.length === 1 ? 'ejercicio' : 'ejercicios'}
        </span>
      </div>

      <div className="space-y-4">
        {exercises.length === 0 ? (
          <div className="text-center py-8 px-4">
            <p className="text-gray-500">No hay ejercicios para este día</p>
            {editMode && (
              <p className="text-sm text-gray-400 mt-2">
                Agrega ejercicios desde la lista disponible
              </p>
            )}
          </div>
        ) : (
          exercises.map((exercise, index) => (
            <WorkoutExerciseCard
              key={exercise.id || `${exercise.exerciseId}-${index}`}
              exercise={exercise}
              orderInDay={index + 1}
              onRemove={editMode && onRemoveExercise ? () => onRemoveExercise(exercise.id) : undefined}
              onUpdate={editMode && onUpdateExercise ? (updates: Partial<RoutineExercise>) => onUpdateExercise(exercise.id, updates) : undefined}
              editMode={editMode}
            />
          ))
        )}
      </div>
    </div>
  );
};

function getDayName(dayNumber: number): string {
  const dayNames: Record<number, string> = {
    1: 'Día 1 - Lunes',
    2: 'Día 2 - Martes',
    3: 'Día 3 - Miércoles',
    4: 'Día 4 - Jueves',
    5: 'Día 5 - Viernes',
    6: 'Día 6 - Sábado',
    7: 'Día 7 - Domingo',
  };

  return dayNames[dayNumber] || `Día ${dayNumber}`;
}
