import React from 'react';
import { Eye } from 'lucide-react';
import type { WorkoutRoutine } from '../../../../shared/types/workout.types';
import { confirm } from '../../../../hooks/useNotification';

interface Props {
  routine: WorkoutRoutine;
  onStart?: (routine: WorkoutRoutine) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClone?: (id: string) => void; // Nuevo prop para clonar rutinas públicas
  onPreview?: (id: string) => void; // Nuevo prop para ver preview
  isPublic?: boolean; // Flag para saber si es rutina pública
}

const WorkoutCard: React.FC<Props> = ({ routine, onStart, onEdit, onDelete, onClone, onPreview, isPublic }) => {
  // Calcular stats robustamente
  const exercisesCount = routine.exercises?.length ?? 0;
  const totalSets = routine.exercises?.reduce((sum, ex) => {
    const sets = ex.sets ?? 0;
    return sum + sets;
  }, 0) ?? 0;

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
          {/* Botón Preview - Siempre visible */}
          {onPreview && (
            <button
              onClick={() => onPreview(routine.id)}
              className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              title="Ver detalles"
            >
              <Eye className="w-5 h-5" />
              <span className="hidden sm:inline">Ver</span>
            </button>
          )}
          
          <button
            onClick={() => onStart?.(routine)}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            {isPublic ? 'Usar' : 'Iniciar'}
          </button>
          
          {isPublic && onClone && (
            <button
              onClick={() => onClone(routine.id)}
              className="px-4 py-3 border-2 border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors flex items-center gap-2"
              title="Clonar rutina a tu colección"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="hidden sm:inline">Clonar</span>
            </button>
          )}
          
          {!isPublic && onEdit && (
            <button
              onClick={() => onEdit(routine.id)}
              className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              title="Editar"
            >
              ✏️
            </button>
          )}
          
          {!isPublic && onDelete && (
            <button
              onClick={async () => {
                const confirmed = await confirm(
                  'Eliminar rutina',
                  `¿Estás seguro de eliminar la rutina "${routine.name}"? Esta acción no se puede deshacer.`,
                  {
                    confirmText: 'Eliminar',
                    cancelText: 'Cancelar',
                    type: 'danger'
                  }
                );
                if (confirmed) {
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
