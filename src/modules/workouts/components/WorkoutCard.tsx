import React from 'react';
import type { WorkoutRoutine } from '../../../shared/types/workout.types';

interface Props {
  routine: WorkoutRoutine;
  onStart?: (routine: WorkoutRoutine) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const WorkoutCard: React.FC<Props> = ({ routine, onStart, onEdit, onDelete }) => {
  const exercisesCount = routine.exercises?.length ?? 0;
  const totalSets = routine.exercises?.reduce((sum, ex) => sum + ex.sets, 0) ?? 0;

  const getDifficultyStyle = (level?: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (level?: string) => {
    switch (level) {
      case 'beginner':
        return 'Principiante';
      case 'intermediate':
        return 'Intermedio';
      case 'advanced':
        return 'Avanzado';
      default:
        return 'Sin nivel';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-orange-300">
      {/* Header con color */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4">
        <h3 className="text-xl font-bold text-white mb-1">{routine.name}</h3>
        {routine.description && (
          <p className="text-orange-50 text-sm line-clamp-2">{routine.description}</p>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center bg-gray-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-orange-600">{exercisesCount}</div>
            <div className="text-xs text-gray-600 mt-1">Ejercicios</div>
          </div>
          <div className="text-center bg-gray-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-orange-600">{totalSets}</div>
            <div className="text-xs text-gray-600 mt-1">Series</div>
          </div>
          <div className="text-center bg-gray-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-orange-600">
              {routine.daysPerWeek ?? '-'}
            </div>
            <div className="text-xs text-gray-600 mt-1">Días/sem</div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getDifficultyStyle(routine.difficultyLevel)}`}>
            {getDifficultyLabel(routine.difficultyLevel)}
          </span>
          {routine.goal && (
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
              {routine.goal}
            </span>
          )}
          {routine.generatedByAi && (
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
              🤖 IA
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onStart?.(routine)}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
          >
            ▶ Iniciar
          </button>
          
          {onEdit && (
            <button
              onClick={() => onEdit(routine.id)}
              className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              title="Editar"
            >
              ✏️
            </button>
          )}
          
          {onDelete && (
            <button
              onClick={() => {
                if (window.confirm(`¿Eliminar la rutina "${routine.name}"?`)) {
                  onDelete(routine.id);
                }
              }}
              className="px-4 py-3 border-2 border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              title="Eliminar"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutCard;
