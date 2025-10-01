import React from 'react';
import type { WorkoutRoutine } from '../../../shared/types/workout.types';

interface Props {
  routine: WorkoutRoutine;
  onStart?: (id: string) => void;
}

const WorkoutCard: React.FC<Props> = ({ routine, onStart }) => {
  const exercisesCount = routine.exercises?.length ?? 0;

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{routine.name}</h3>
        <p className="text-sm text-gray-500 mb-3">{routine.description ?? ''}</p>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span>{exercisesCount} ejercicios</span>
          <span>{routine.durationWeeks ? `${routine.durationWeeks} semanas` : '—'}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <span className={`px-2 py-1 text-xs rounded-full ${
          routine.difficultyLevel === 'beginner' ? 'bg-green-100 text-green-800' :
          routine.difficultyLevel === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>{routine.difficultyLevel ?? 'Intermedio'}</span>

        <button
          onClick={() => onStart?.(String(routine.id))}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Iniciar
        </button>
      </div>
    </div>
  );
};

export default WorkoutCard;
